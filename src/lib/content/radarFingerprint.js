// URL-Fingerprinter (Phase 2). Holt eine Shop-/Firmen-URL per HTTP (kein Browser),
// erkennt Plattform/Version/Theme, Inhouse- vs. Agentur-Indizien, Karriereseite,
// Ansprechpartner aus dem Impressum und leitet technische Findings ab. Robots-
// konform, eigener User-Agent, Timeout + Größenlimit. Erfindet nichts — fehlt ein
// Signal, bleibt das Feld leer; jedes Ergebnis trägt einen Beleg (Quell-URL).

import { gunzipSync } from 'node:zlib';

const UA = 'Mozilla/5.0 (compatible; RvdRadar/1.0; +https://rene-van-dinter.de)';
const TIMEOUT_MS = 10000;
const MAX_BYTES = 2_000_000;

export function normalizeUrl(raw) {
    let s = (raw || '').toString().trim();
    if (!s) return null;
    if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
    try {
        const u = new URL(s);
        return { url: u.toString(), origin: u.origin, domain: u.hostname.replace(/^www\./, '').toLowerCase() };
    } catch { return null; }
}

async function fetchText(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            signal: ctrl.signal, redirect: 'follow',
            headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
        });
        const html = (await res.text()).slice(0, MAX_BYTES);
        return { status: res.status, headers: res.headers, html };
    } finally { clearTimeout(t); }
}

// robots.txt: nur prüfen, ob „/" für alle gesperrt ist (einfach, konservativ).
async function robotsAllowsRoot(origin) {
    try {
        const res = await fetch(`${origin}/robots.txt`, { headers: { 'user-agent': UA } });
        if (!res.ok) return true; // keine robots.txt → erlaubt
        const txt = (await res.text()).slice(0, 100_000).toLowerCase();
        // sehr grobe Auswertung des „*"-Blocks
        const star = txt.split(/user-agent:/).find((b) => b.trim().startsWith('*'));
        if (star && /disallow:\s*\/\s*(\n|$)/.test(star)) return false;
        return true;
    } catch { return true; }
}

// Sitemap(-Index) einlesen und alle URLs sammeln (gedeckelt). Findet Jobs-/
// Impressum-/Kontakt-Seiten zuverlässiger als das reine Startseiten-Scannen.
async function fetchSitemapUrls(origin) {
    const collect = async (u) => {
        try {
            const res = await fetch(u, { headers: { 'user-agent': UA } });
            if (!res.ok) return { isIndex: false, locs: [] };
            const buf = Buffer.from(await res.arrayBuffer());
            // Shopware & Co. liefern die Kind-Sitemaps gzip-komprimiert (.xml.gz);
            // fetch entpackt nur per Content-Encoding, nicht nach Dateiendung.
            const gz = /\.gz(\?|$)/i.test(u) || (buf[0] === 0x1f && buf[1] === 0x8b);
            let xml;
            try { xml = (gz ? gunzipSync(buf) : buf).toString('utf8').slice(0, MAX_BYTES); }
            catch { xml = buf.toString('utf8').slice(0, MAX_BYTES); }
            const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
            return { isIndex: /<sitemapindex/i.test(xml), locs };
        } catch { return { isIndex: false, locs: [] }; }
    };
    const root = await collect(`${origin}/sitemap.xml`);
    if (!root.locs.length) return [];
    if (!root.isIndex) return root.locs.slice(0, 3000);
    const urls = [];
    for (const sm of root.locs.slice(0, 4)) { // nur wenige Kind-Sitemaps
        const child = await collect(sm);
        urls.push(...child.locs);
        if (urls.length > 3000) break;
    }
    return urls.slice(0, 3000);
}

// Erste URL aus einer Liste, deren Pfad ein Keyword enthält.
function pickUrl(urls, re) {
    const rx = new RegExp(re, 'i');
    return urls.find((u) => rx.test(u)) || '';
}

function findLink(html, re) {
    const m = html.match(new RegExp(`href=["']([^"']*(?:${re})[^"']*)["']`, 'i'));
    return m ? m[1] : '';
}
function abs(origin, href) {
    if (!href) return '';
    try { return new URL(href, origin).toString(); } catch { return ''; }
}

// Häufige HTML-Entities in extrahierten Texten (Titel/Impressum) auflösen.
function decodeEntities(s) {
    return (s || '')
        .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"').replace(/&#0?39;|&apos;/gi, "'").replace(/&nbsp;/gi, ' ')
        .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

export function detectPlatform(html, headers) {
    const belege = [];
    const push = (signal, beleg) => belege.push({ signal, beleg });
    let plattform = 'unbekannt'; let confidence = 0; let version = ''; let eol = 0; let frontend = 'unklar';

    const sw6 = /\/bundles\/(storefront|framework)\//i.test(html) || /data-cms-|window\.PluginManager|swagcustomizedproducts|--sw-/i.test(html) || /csrf\/generate/i.test(html);
    const sw5 = /\/frontend\/_public\/|engine\/Shopware|is--act|require\.config/i.test(html);
    const gen = html.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)["']/i);
    if (gen && /shopware/i.test(gen[1])) { push('generator-Meta', gen[1]); const v = gen[1].match(/(\d+\.\d+(?:\.\d+)?)/); if (v) version = v[1]; }

    if (sw6 || (gen && /shopware\s*6/i.test(gen[1]))) { plattform = 'shopware6'; confidence = sw6 ? 0.9 : 0.7; push('Shopware-6-Marker', '/bundles/storefront/, PluginManager …'); }
    else if (sw5 || (gen && /shopware\s*5/i.test(gen[1]))) { plattform = 'shopware5'; confidence = 0.8; eol = 1; push('Shopware-5-Marker', 'engine/Shopware, /frontend/_public/'); }
    else if (/cdn\.shopify\.com|shopify/i.test(html)) { plattform = 'shopify'; confidence = 0.8; push('Shopify-Marker', 'cdn.shopify.com'); }
    else if (/mage-|data-mage-init|\/static\/version|Magento_|mageplaza/i.test(html)) { plattform = 'magento'; confidence = 0.8; push('Magento-Marker', 'mage-init / /static/version'); }
    else if (/woocommerce|wp-content\/plugins\/woo/i.test(html)) { plattform = 'woocommerce'; confidence = 0.75; push('WooCommerce-Marker', 'wp-content/.../woocommerce'); }
    else if (/oxid|oxideshop|\/out\/(azure|flow|wave|src)\/|oxbase/i.test(html)) { plattform = 'oxid'; confidence = 0.6; push('Oxid-Marker', 'oxid / /out/<theme>/'); }

    if (/__NEXT_DATA__|_next\/static/i.test(html)) frontend = 'headless_next';
    else if (/data-v-[0-9a-f]{8}|__vue__/i.test(html)) frontend = 'headless_vue';
    else if (plattform.startsWith('shopware')) frontend = 'twig_storefront';

    // eigene Plugin-Namespaces (Inhouse-Indiz): /bundles/<name>/ außer Standard.
    const ns = [...html.matchAll(/\/bundles\/([a-z0-9]+)\//gi)].map((m) => m[1].toLowerCase())
        .filter((n) => !['storefront', 'framework', 'administration', 'elasticsearch'].includes(n));
    const eigene = [...new Set(ns)].slice(0, 5);
    if (eigene.length) push('eigene Bundles', eigene.join(', '));

    const server = headers.get('server') || '';
    const theme_typ = plattform.startsWith('shopware') ? (eigene.length ? 'custom' : 'unklar') : '';

    return { plattform, plattform_confidence: confidence, version, version_eol: eol, frontend, theme_typ, eigene_namespaces: eigene.join(', '), server_header: server, belege };
}

function detectAgency(html) {
    const m = html.match(/(realisiert|umgesetzt|entwickelt|programmiert|powered)\s+(von|by|durch)[^<]{0,80}/i)
        || html.match(/(webdesign|webentwicklung|onlineshop)\s+(von|by)[^<]{0,60}/i);
    return m ? m[0].replace(/\s+/g, ' ').trim() : '';
}

function extractContact(html) {
    // Erste echte E-Mail — Retina-/Asset-Dateinamen (logo@2x.png, sprite@3x.svg …)
    // matchen sonst als vermeintliche Adresse.
    const emails = [...html.matchAll(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi)].map((m) => m[0]);
    const email = emails.find((e) => !/@\dx\./i.test(e) && !/\.(png|jpe?g|gif|svg|webp|ico|css|js|woff2?|mp4)$/i.test(e)) || '';
    // Firmenname/Rechtsform grob aus Impressum-Text.
    const rechts = (html.match(/([A-ZÄÖÜ][\w&.\- ]{2,60}?\s(GmbH(?:\s*&\s*Co\.?\s*KG)?|AG|UG(?:\s*\(haftungsbeschränkt\))?|e\.K\.|GbR|KG|OHG))/) || [])[1] || '';
    const plz = (html.match(/\b(\d{5})\s+([A-ZÄÖÜ][a-zäöüß.\- ]{2,40})/) || []);
    // Für Text-Felder Tags entfernen (Impressum steht oft in <p>/<br>-Blöcken).
    const text = decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
    // Handelsregister: „HRB 12345" / „HRB Nummer: 12345" (+ Amtsgericht wenn nah dabei).
    const hrm = text.match(/\bHR([AB])\b[\s.:]*(?:Nummer|Nr\.?)?[\s.:]*(\d{1,7})/i);
    const hr = hrm ? `HR${hrm[1].toUpperCase()} ${hrm[2]}` : '';
    const gericht = (text.match(/(?:Amtsgericht|Registergericht)\s+([A-ZÄÖÜ][a-zäöüßA-ZÄÖÜ.\- ]{2,30}?)(?=[,.;:]|\s{2}|\sHR|\sUSt|$)/) || [])[1] || '';
    const handelsregister = [hr, gericht ? `Amtsgericht ${gericht.trim()}` : ''].filter(Boolean).join(' · ');
    // USt-IdNr: DE + 9 Ziffern (Leerzeichen tolerieren).
    const ust = (text.match(/\bDE\s?\d{3}\s?\d{3}\s?\d{3}\b/) || [])[0] || '';
    // Geschäftsführer/Vertreten durch: 1–4 großgeschriebene Namens-Token, aber vor
    // den nächsten Impressum-Labels stoppen (Zuständiges/Gericht/Sitz/HRB/USt …).
    const STOP = 'Zuständige\\w*|Gericht|Amtsgericht|Registergericht|Handelsregister|Register|Sitz|USt|Umsatzsteuer|Steuernummer|Telefon|Fax|HRA|HRB|E-?Mail';
    const gfm = text.match(new RegExp(
        '(?:Geschäftsführer(?:in|ende[rn]?)?(?:\\s+Gesellschafter)?|Vertretungsberechtigt\\w*|Vertreten durch|Inhaber(?:in)?|Vorstand)\\s*:?\\s+'
        + `([A-ZÄÖÜ][A-Za-zÄÖÜäöüß.\\-]+(?:\\s+(?!(?:${STOP})\\b)[A-ZÄÖÜ][A-Za-zÄÖÜäöüß.\\-]+){0,3})`,
    ));
    const geschaeftsfuehrer = gfm ? gfm[1].replace(/\s+/g, ' ').trim() : '';
    return {
        email, rechtsform: rechts ? decodeEntities(rechts).replace(/\s+/g, ' ').trim() : '',
        plz: plz[1] || '', ort: decodeEntities((plz[2] || '').trim()),
        handelsregister, ust_id: ust.replace(/\s/g, ''), geschaeftsfuehrer,
    };
}

// Shop-Check: erzeugt aus dem bereits geholten HTML + Headern einen Fehlerbericht
// (Findings). Kein zusätzlicher Request. Rechtliches/SEO/Security sind statisch gut
// prüfbar — echte Performance/Barrierefreiheit bräuchte Lighthouse (bewusst außen vor).
function runShopChecks({ html, headers, url, sec, hasImpressum, hasDatenschutz }) {
    const f = [];
    const add = (typ, schwere, titel, beschreibung, verwendbar_als = 'gespraechsthema') => f.push({ typ, schwere, titel, beschreibung, beleg_url: url, verwendbar_als });

    // ── DE-Recht (die stärksten, legitimen Akquise-Aufhänger) ──
    if (!hasImpressum) add('recht_impressum', 'hoch', 'Impressum nicht auffindbar', 'Auf Startseite/Sitemap kein Impressum-Link gefunden — in Deutschland Pflicht (§ 5 DDG).', 'akquise_aufhaenger');
    if (!hasDatenschutz) add('recht_datenschutz', 'hoch', 'Datenschutzerklärung nicht auffindbar', 'Kein Link zu einer Datenschutzerklärung gefunden — DSGVO-Pflicht.', 'akquise_aufhaenger');
    if (!/cookiebot|usercentrics|borlabs|klaro|cookie-?consent|onetrust|consentmanager|ccm19|cookiefirst|complianz/i.test(html)) {
        add('recht_cookie', 'mittel', 'Kein Cookie-Consent erkennbar', 'Kein gängiges Consent-Tool im HTML gefunden — bei Cookies/Tracking in DE Pflicht.', 'akquise_aufhaenger');
    }

    // ── Sicherheit ──
    const missing = [];
    if (!sec.hsts) missing.push('HSTS');
    if (!sec.csp) missing.push('CSP');
    if (!sec.xfo) missing.push('X-Frame-Options');
    if (!sec.xcto) missing.push('X-Content-Type-Options');
    if (!sec.ref) missing.push('Referrer-Policy');
    if (missing.length) add('security_header', missing.length >= 3 ? 'mittel' : 'info', 'Fehlende Security-Header', `${missing.join(', ')} nicht gesetzt.`, missing.length >= 3 ? 'akquise_aufhaenger' : 'gespraechsthema');
    const server = headers.get('server') || '';
    if (/\d+\.\d+/.test(server)) add('security_server', 'info', 'Server-Version sichtbar', `Server-Header verrät Version: ${server}.`, 'intern_nur');

    // ── SEO / Darstellung ──
    const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1]?.trim() || '';
    if (!title) add('seo_title', 'mittel', 'Kein Seitentitel', 'Startseite ohne <title>.', 'gespraechsthema');
    else if (title.length > 65) add('seo_title', 'info', 'Seitentitel sehr lang', `Titel ${title.length} Zeichen (>65 wird in Suchergebnissen abgeschnitten).`, 'gespraechsthema');
    if (!/<meta[^>]+name=["']description["']/i.test(html)) add('seo_desc', 'mittel', 'Keine Meta-Description', 'Startseite ohne Meta-Description.', 'gespraechsthema');
    const h1 = (html.match(/<h1[\s>]/gi) || []).length;
    if (h1 === 0) add('seo_h1', 'info', 'Keine H1-Überschrift', 'Startseite ohne H1.', 'gespraechsthema');
    else if (h1 > 1) add('seo_h1', 'info', 'Mehrere H1', `${h1} H1-Überschriften auf der Startseite.`, 'gespraechsthema');
    if (!/<meta[^>]+name=["']viewport["']/i.test(html)) add('mobil_viewport', 'mittel', 'Kein Viewport-Meta', 'Kein viewport-Meta — Seite vermutlich nicht mobiloptimiert.', 'akquise_aufhaenger');
    if (!/<link[^>]+rel=["']canonical["']/i.test(html)) add('seo_canonical', 'info', 'Kein Canonical-Link', 'Kein rel=canonical auf der Startseite.', 'gespraechsthema');
    if (!/<meta[^>]+property=["']og:/i.test(html)) add('seo_og', 'info', 'Keine Open-Graph-Tags', 'Keine og:-Tags (Social-Sharing-Vorschau fehlt).', 'gespraechsthema');

    // ── Barrierefreiheit ──
    if (!/<html[^>]+lang=/i.test(html)) add('a11y_lang', 'info', 'Kein lang-Attribut', '<html> ohne lang-Attribut (Barrierefreiheit/SEO).', 'gespraechsthema');
    const imgs = html.match(/<img\b[^>]*>/gi) || [];
    const noAlt = imgs.filter((t) => !/\balt\s*=/i.test(t)).length;
    if (imgs.length >= 5 && noAlt / imgs.length > 0.3) add('a11y_alt', 'info', 'Bilder ohne Alt-Text', `${noAlt} von ${imgs.length} Bildern ohne alt-Attribut.`, 'gespraechsthema');

    return f;
}

export async function fingerprintUrl(rawUrl) {
    const n = normalizeUrl(rawUrl);
    if (!n) return { ok: false, error: 'Ungültige URL.' };

    if (!(await robotsAllowsRoot(n.origin))) {
        return { ok: false, blocked: true, error: 'robots.txt verbietet den Zugriff — Domain ausgesetzt.' };
    }

    let home;
    try { home = await fetchText(n.url); } catch (e) { return { ok: false, error: `Nicht erreichbar (${e.name === 'AbortError' ? 'Timeout' : 'Fetch-Fehler'}).` }; }
    if (home.status === 403 || home.status === 429) return { ok: false, blocked: true, error: `Zugriff abgewiesen (${home.status}) — Domain aussetzen.` };
    const html = home.html;

    const platform = detectPlatform(html, home.headers);
    const agentur_credit = detectAgency(html);
    const githubLink = findLink(html, 'github\\.com');
    const github_org = githubLink ? (githubLink.match(/github\.com\/([^\/"']+)/i) || [])[1] || '' : '';
    const linkedin_url = abs(n.origin, findLink(html, 'linkedin\\.com'));
    const title = decodeEntities((html.match(/<title[^>]*>([^<]+)</i) || [])[1]?.trim() || '');
    const name = title.split(/[|\-–—:]/)[0].trim().slice(0, 80);

    // Sitemap laden und daraus Jobs-/Impressum-/Kontakt-Seiten per Keyword ziehen —
    // fängt auch Seiten wie /ueber-uns/jobs-bei-… ab, die im Startseiten-Menü fehlen.
    const sitemapUrls = await fetchSitemapUrls(n.origin);
    // Karriere-URL streng als Pfad-Segment matchen — verhindert Fehltreffer wie
    // /bestellen, /baustellenzubehoer, /ausstellung (bloße Substrings von „stellen").
    const CAREER_SEG = /(^|[/_-])(karrieren?|jobs?|stellenangebote?|stellenausschreibung|offene-stellen|arbeiten-bei|karriere-bei|join-?us|werde-teil|wir-suchen)([/_.?-]|$)/i;
    const IMPR_RE = 'impressum|imprint|legal';
    const KONTAKT_RE = 'kontakt|contact';

    // Shopware-6-Sitemap-Signatur (/sitemap/salesChannel-<hash>/) ist eindeutig —
    // korrigiert schwächere/falsche Startseiten-Treffer (z. B. Oxid-Fehlalarm).
    if (platform.plattform_confidence < 0.9 && /\/sitemap\/salesChannel-[0-9a-f]/i.test(sitemapUrls.join('\n'))) {
        platform.plattform = 'shopware6';
        platform.plattform_confidence = 0.9;
        platform.version_eol = 0;
        if (platform.frontend === 'unklar') platform.frontend = 'twig_storefront';
        platform.belege = [...(platform.belege || []), { signal: 'Shopware-6-Sitemap', beleg: '/sitemap/salesChannel-…' }];
    }

    let karriere_url = sitemapUrls.find((u) => CAREER_SEG.test(u)) || '';
    if (!karriere_url) {
        for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) {
            if (CAREER_SEG.test(m[1])) { karriere_url = abs(n.origin, m[1]); break; }
        }
    }
    const imprUrlAbs = pickUrl(sitemapUrls, IMPR_RE) || abs(n.origin, findLink(html, IMPR_RE));
    const kontaktUrlAbs = pickUrl(sitemapUrls, KONTAKT_RE) || abs(n.origin, findLink(html, KONTAKT_RE));

    // Impressum → Kontakt/Rechtsform; wenn dort keine Mail steht, Kontaktseite nachladen.
    let contact = { email: '', rechtsform: '', plz: '', ort: '', handelsregister: '', ust_id: '', geschaeftsfuehrer: '' };
    if (imprUrlAbs) {
        try { const impr = await fetchText(imprUrlAbs); contact = extractContact(impr.html); } catch { /* egal */ }
    }
    if (!contact.email && kontaktUrlAbs) {
        try { const kon = await fetchText(kontaktUrlAbs); const c = extractContact(kon.html); contact = { ...contact, ...Object.fromEntries(Object.entries(c).filter(([, v]) => v)) }; } catch { /* egal */ }
    }
    if (!contact.email) contact = { ...contact, ...extractContact(html) };

    // Security-Header + Shop-Check (Fehlerbericht).
    const h = home.headers;
    const sec = {
        hsts: !!h.get('strict-transport-security'),
        csp: !!h.get('content-security-policy'),
        xfo: !!h.get('x-frame-options'),
        xcto: !!h.get('x-content-type-options'),
        ref: !!h.get('referrer-policy'),
    };
    const datenschutzUrl = pickUrl(sitemapUrls, 'datenschutz|privacy|disclaimer|data-protection')
        || abs(n.origin, findLink(html, 'datenschutz|privacy|disclaimer|data-protection'));
    const findings = [];
    if (platform.version_eol) findings.push({ typ: 'eol_version', schwere: 'hoch', titel: 'Veraltete Shop-Version (EOL)', beschreibung: `${platform.plattform} ohne Sicherheitsupdates — Migrations-Aufhänger.`, beleg_url: n.url, verwendbar_als: 'akquise_aufhaenger' });
    findings.push(...runShopChecks({ html, headers: h, url: n.url, sec, hasImpressum: !!imprUrlAbs, hasDatenschutz: !!datenschutzUrl }));

    // Inhouse vs. Agentur: eigene Bundles/GitHub = Inhouse-Indiz; Agentur-Credit = Agentur.
    const inhouseSignal = platform.eigene_namespaces || github_org;
    const team_signal = inhouseSignal ? 'ja' : (agentur_credit ? 'nein' : 'unklar');

    return {
        ok: true,
        company: {
            domain: n.domain, name, rechtsform: contact.rechtsform, plz: contact.plz, ort: contact.ort,
            handelsregister: contact.handelsregister, ust_id: contact.ust_id, geschaeftsfuehrer: contact.geschaeftsfuehrer,
            karriere_url, linkedin_url, github_org, inhouse_team: team_signal,
            notiz: `Auto-Scan ${new Date().toISOString().slice(0, 10)}: ${platform.plattform}${platform.version ? ' ' + platform.version : ''}${agentur_credit ? ' · ' + agentur_credit : ''}`,
        },
        contact,
        snapshot: {
            ...platform,
            agentur_credit,
            security_header: JSON.stringify(sec),
            belege: JSON.stringify(platform.belege),
        },
        findings,
        team_signal,
    };
}

// ─── Karriereseite → Stellen (Phase 3A, on-demand) ───────────────────────────
// Holt die (bereits erkannte) Karriere-URL und extrahiert Stellentitel: statisch
// aus dem HTML plus strukturierte Feeds gängiger ATS (Personio/Greenhouse/
// Recruitee). Kein Browser → reine JS-Widgets ohne Feed bleiben unsichtbar.

// „(m/w/d)" & Varianten sind das präziseste Signal für einen Stellentitel.
const GENDER_MARK = /\((?:m\/w\/d|w\/m\/d|d\/m\/w|m\/w\/x|m\/w|w\/m|m\/f\/d|all genders?|divers|gn|a\*|m\/w\/i)\)/i;
const NON_TITLE = /^(mehr|details|mehr erfahren|weiterlesen|read more|apply|jetzt bewerben|bewerben|hier bewerben|zur stelle|ansehen|view|open)/i;
// Sektions-/Navi-Links („Jobs bei X", „Offene Stellen") sind keine einzelnen Stellen.
const SECTION_TEXT = /^(jobs?|stellen(angebote)?|karriere|offene stellen|alle stellen|zu den (jobs|stellen)|(jobs|karriere|arbeiten) bei\b|unsere (jobs|stellen))/i;

function extractCareerJobs(html, baseUrl) {
    const jobs = [];
    const seen = new Set();
    const add = (titel, href, standort = '') => {
        const t = decodeEntities((titel || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
        if (!t || t.length < 5 || t.length > 120) return;
        const key = t.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        jobs.push({ titel: t, url: href ? abs(baseUrl, href) : '', standort: standort.trim() });
    };
    // Links: Gender-Marker (hohe Präzision) oder eindeutig job-artige URL.
    const jobHref = /\/(jobs?|stellen?|stellenangebote?|position|vacan|karriere\/[^"'#?]+|offene-stellen)\b/i;
    for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
        const href = m[1];
        const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!text) continue;
        if (GENDER_MARK.test(text)) add(text, href);
        else if (jobHref.test(href) && text.length >= 6 && text.length <= 100 && !NON_TITLE.test(text) && !SECTION_TEXT.test(text)) add(text, href);
    }
    // Überschriften mit Gender-Marker (Listen-Karriereseiten ohne Einzel-Links).
    for (const m of html.matchAll(/<h[1-5][^>]*>([\s\S]*?)<\/h[1-5]>/gi)) {
        if (GENDER_MARK.test(m[1])) add(m[1], '');
    }
    return jobs;
}

async function fetchAtsJobs(html, origin) {
    const out = [];
    const grab = async (url) => {
        try { const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json,application/xml,text/xml' } }); return r.ok ? (await r.text()).slice(0, MAX_BYTES) : ''; } catch { return ''; }
    };
    const hay = `${html} ${origin}`;

    // Personio: XML-Feed <company>.jobs.personio.de/xml
    const pm = hay.match(/https?:\/\/([a-z0-9-]+)\.jobs\.personio\.(?:de|com)/i);
    if (pm) {
        const xml = await grab(`https://${pm[1]}.jobs.personio.de/xml`);
        for (const block of xml.match(/<position>[\s\S]*?<\/position>/gi) || []) {
            const name = (block.match(/<name>([\s\S]*?)<\/name>/i) || [])[1];
            const office = (block.match(/<office>([\s\S]*?)<\/office>/i) || [])[1] || '';
            if (name) out.push({ titel: decodeEntities(name).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(), url: '', standort: decodeEntities(office).trim() });
        }
    }
    // Greenhouse: JSON-Board
    const gm = hay.match(/(?:boards\.greenhouse\.io|grnhse\.[^"'/]*\/boards)\/([a-z0-9_-]+)/i);
    if (gm) {
        const js = await grab(`https://boards-api.greenhouse.io/v1/boards/${gm[1]}/jobs`);
        try { for (const j of (JSON.parse(js).jobs || [])) out.push({ titel: (j.title || '').trim(), url: j.absolute_url || '', standort: (j.location && j.location.name) || '' }); } catch { /* egal */ }
    }
    // Recruitee: JSON-Offers
    const rm = hay.match(/https?:\/\/([a-z0-9-]+)\.recruitee\.com/i);
    if (rm) {
        const js = await grab(`https://${rm[1]}.recruitee.com/api/offers/`);
        try { for (const o of (JSON.parse(js).offers || [])) out.push({ titel: (o.title || '').trim(), url: o.careers_url || o.careers_apply_url || '', standort: [o.city, o.country_code].filter(Boolean).join(', ') }); } catch { /* egal */ }
    }
    return out;
}

// JobPosting-JSON-LD (schema.org) aus <script type="application/ld+json"> lesen —
// dasselbe strukturierte Markup, das Google Jobs nutzt. Verlässlicher als Heuristik
// (Titel/Ort/Datum direkt). Verschachtelung (Array, @graph) wird aufgelöst.
function extractJsonLdJobs(html, baseUrl) {
    const jobs = [];
    const seen = new Set();
    const pushJob = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        const types = [].concat(obj['@type'] || []).map((t) => String(t).toLowerCase());
        if (!types.includes('jobposting')) return;
        const titel = decodeEntities(String(obj.title || obj.name || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
        if (!titel || titel.length < 3 || titel.length > 160) return;
        const key = titel.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        let standort = '';
        for (const l of [].concat(obj.jobLocation || [])) {
            const a = (l && l.address) || {};
            if (typeof a === 'string') { standort = a; break; }
            standort = [a.postalCode || '', a.addressLocality || ''].filter(Boolean).join(' ').trim();
            if (standort) break;
        }
        let url = obj.url || (obj.hiringOrganization && obj.hiringOrganization.sameAs) || '';
        url = url ? abs(baseUrl, String(url)) : '';
        jobs.push({ titel, url, standort });
    };
    const walk = (node, depth) => {
        if (!node || depth > 6) return;
        if (Array.isArray(node)) { node.forEach((x) => walk(x, depth + 1)); return; }
        if (typeof node !== 'object') return;
        pushJob(node);
        if (node['@graph']) walk(node['@graph'], depth + 1);
    };
    for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
        const raw = m[1].trim();
        if (!raw) continue;
        try { walk(JSON.parse(raw), 0); } catch { /* defektes/mehrfaches JSON überspringen */ }
    }
    return jobs;
}

export async function scrapeCareerJobs(rawUrl) {
    const n = normalizeUrl(rawUrl);
    if (!n) return { ok: false, error: 'Ungültige Karriere-URL.' };
    if (!(await robotsAllowsRoot(n.origin))) return { ok: false, error: 'robots.txt verbietet den Zugriff.' };

    let page;
    try { page = await fetchText(n.url); } catch (e) { return { ok: false, error: `Karriereseite nicht erreichbar (${e.name === 'AbortError' ? 'Timeout' : 'Fehler'}).` }; }
    if (page.status === 403 || page.status === 429) return { ok: false, error: `Zugriff abgewiesen (${page.status}).` };

    // Reihenfolge nach Verlässlichkeit: JSON-LD (strukturiert) → ATS-Feed → Heuristik.
    const jsonld = extractJsonLdJobs(page.html, n.url);
    const jobs = [...jsonld];
    const seen = new Set(jobs.map((j) => j.titel.toLowerCase()));
    const merge = (list) => {
        for (const j of list) {
            const t = (j.titel || '').trim();
            if (!t || t.length < 5) continue;
            const k = t.toLowerCase();
            if (seen.has(k)) continue;
            seen.add(k);
            jobs.push({ titel: t, url: j.url || '', standort: j.standort || '' });
        }
    };
    const ats = await fetchAtsJobs(page.html, n.origin);
    merge(ats);
    merge(extractCareerJobs(page.html, n.url));

    // JS-Widget, das die Stellen erst clientseitig lädt und keinen lesbaren Feed hat
    // → ehrlicher Hinweis statt stiller 0 (kein Browser, keine undokumentierte API).
    let widget = '';
    if (!jobs.length) {
        if (/join\.com\/api\/widget/i.test(page.html)) widget = 'JOIN';
        else if (/(?:softgarden|smartrecruiters|workday|personio-widget|jobs2web|prescreen)/i.test(page.html)) widget = 'externes Bewerber-Widget';
    }
    const source = [jsonld.length ? 'jsonld' : '', ats.length ? 'ats' : '', 'html'].filter(Boolean).join('+');
    return { ok: true, jobs: jobs.slice(0, 60), source, widget };
}
