import { createHash } from 'node:crypto';
import geoip from 'geoip-lite';

// Serverseitige Anreicherung eines eingehenden Events — leitet aus IP, UA und
// Referrer die anonymen Analyse-Merkmale ab. IP und roher UA werden dabei NIE
// gespeichert: Aus der IP entsteht nur der Tages-Hash + der Ländercode, aus dem
// UA nur Gerät/Browser/OS-Familie.

// --- Referrer-Klassifikation ---------------------------------------------

const OWN_HOSTS = ['rene-van-dinter.de', 'www.rene-van-dinter.de', 'localhost'];

// Domain-Fragmente je Quelle. Reihenfolge egal; erster Treffer gewinnt.
const REF_RULES = [
    { source: 'ai', match: ['chatgpt.com', 'chat.openai.com', 'openai.com', 'perplexity.ai', 'claude.ai', 'anthropic.com', 'gemini.google.com', 'bard.google.com', 'copilot.microsoft.com'] },
    { source: 'organic', match: ['google.', 'bing.com', 'duckduckgo.com', 'ecosia.org', 'yahoo.', 'yandex.', 'startpage.com', 'search.brave.com'] },
    { source: 'social', match: ['linkedin.com', 'lnkd.in', 'xing.com', 'facebook.com', 'fb.com', 'instagram.com', 'twitter.com', 't.co', 'x.com', 'youtube.com', 'reddit.com', 'mastodon', 'threads.net'] },
];

function hostFromReferrer(referrer) {
    if (!referrer) return null;
    try {
        return new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
    } catch {
        return null;
    }
}

// Referrer als Domain+Pfad OHNE Query-String (gegen versehentliche PII in
// Query-Parametern), z. B. "www.google.com/search".
function refUrlNoQuery(referrer) {
    if (!referrer) return null;
    try {
        const u = new URL(referrer);
        const path = u.pathname && u.pathname !== '/' ? u.pathname : '';
        return `${u.hostname.replace(/^www\./, '')}${path}`.slice(0, 300);
    } catch {
        return null;
    }
}

/**
 * Klassifiziert den Referrer.
 * Rückgabe: { source, domain, url }. `source`:
 * direct (kein Referrer) | internal (eigene Domain) | ai | organic | social | referral.
 * `url` = Domain+Pfad ohne Query (für den Herkunfts-Detailblick).
 */
export function classifyReferrer(referrer) {
    const host = hostFromReferrer(referrer);
    const url = refUrlNoQuery(referrer);
    if (!host) return { source: 'direct', domain: null, url: null };
    if (OWN_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
        return { source: 'internal', domain: host, url };
    }
    for (const rule of REF_RULES) {
        if (rule.match.some((frag) => host.includes(frag))) {
            return { source: rule.source, domain: host, url };
        }
    }
    return { source: 'referral', domain: host, url };
}

// --- Geräte-/Browser-/OS-Ableitung aus dem User-Agent ---------------------

// Bekannte Crawler/Bots (inkl. der KI-Bots, die wir in robots.txt erlauben) —
// sollen die Menschen-Statistik nicht verfälschen.
const BOT_PATTERN = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|feedfetcher|gptbot|claudebot|claude-|ccbot|perplexity|google-extended|applebot|meta-externalagent|headless|lighthouse|pagespeed|monitor|uptime|curl|wget|python-requests|axios|node-fetch/i;

export function isBot(ua) {
    if (!ua) return true; // ohne UA behandeln wir es vorsichtshalber als Bot
    return BOT_PATTERN.test(ua);
}

export function deviceFromUa(ua = '') {
    const s = ua.toLowerCase();
    if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(s)) return 'tablet';
    if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini/.test(s)) return 'mobile';
    return 'desktop';
}

export function browserFromUa(ua = '') {
    const s = ua.toLowerCase();
    if (s.includes('edg/') || s.includes('edga') || s.includes('edgios')) return 'Edge';
    if (s.includes('opr/') || s.includes('opera')) return 'Opera';
    if (s.includes('samsungbrowser')) return 'Samsung Internet';
    if (s.includes('firefox') || s.includes('fxios')) return 'Firefox';
    if (s.includes('chrome') || s.includes('crios')) return 'Chrome';
    if (s.includes('safari')) return 'Safari';
    return 'Andere';
}

export function osFromUa(ua = '') {
    const s = ua.toLowerCase();
    if (/iphone|ipad|ipod|ios/.test(s)) return 'iOS';
    if (s.includes('android')) return 'Android';
    if (s.includes('mac os') || s.includes('macintosh')) return 'macOS';
    if (s.includes('windows')) return 'Windows';
    if (s.includes('linux') || s.includes('x11')) return 'Linux';
    return 'Andere';
}

// --- Anonymer Tages-Besucher-Hash + Land ----------------------------------

// sha256(window + IP + UA + SALT). `window` ist der Kalendermonat (YYYY-MM):
// Der Hash rotiert monatlich, sodass ein Besucher INNERHALB eines Monats
// wiedererkennbar ist (→ wiederkehrende Besucher, Neu-vs-Wiederkehr), aber
// monatsübergreifend nicht verknüpfbar und nie auf die IP rückführbar ist.
// Die IP verlässt diese Funktion nicht. (Bekannte Grenze: am Monatswechsel
// wird ein Wiederkehrer nicht als solcher erkannt — bewusst akzeptiert.)
export function visitorHash(ip, ua, windowKey) {
    const salt = process.env.ANALYTICS_SALT || 'dev-fallback-salt-change-me';
    return createHash('sha256').update(`${windowKey}|${ip || ''}|${ua || ''}|${salt}`).digest('hex').slice(0, 32);
}

// Ländercode aus der IP (lokale geoip-lite-Tabelle, kein Fremddienst).
// Nur der Code wird zurückgegeben; die IP wird nicht gespeichert.
export function countryFromIp(ip) {
    if (!ip) return null;
    try {
        return geoip.lookup(ip)?.country || null;
    } catch {
        return null;
    }
}

// Extrahiert die Client-IP aus dem Request (hinter dem KeyHelp-Reverse-Proxy
// steht sie in x-forwarded-for; erster Eintrag = ursprünglicher Client).
export function clientIp(headers) {
    const xff = headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    return headers.get('x-real-ip') || '';
}
