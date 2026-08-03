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

function detectPlatform(html, headers) {
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
    return { email, rechtsform: rechts ? rechts.replace(/\s+/g, ' ').trim() : '', plz: plz[1] || '', ort: (plz[2] || '').trim() };
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
    const title = (html.match(/<title[^>]*>([^<]+)</i) || [])[1]?.trim() || '';
    const name = title.split(/[|\-–—:]/)[0].trim().slice(0, 80);

    // Sitemap laden und daraus Jobs-/Impressum-/Kontakt-Seiten per Keyword ziehen —
    // fängt auch Seiten wie /ueber-uns/jobs-bei-… ab, die im Startseiten-Menü fehlen.
    const sitemapUrls = await fetchSitemapUrls(n.origin);
    const JOB_RE = 'karriere|jobs?|stellen|stellenangebot|career|join-?us|arbeiten-bei|mitarbeiter|vacan|werde-teil|offene-stellen';
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

    const karriere_url = pickUrl(sitemapUrls, JOB_RE) || abs(n.origin, findLink(html, JOB_RE));
    const imprUrlAbs = pickUrl(sitemapUrls, IMPR_RE) || abs(n.origin, findLink(html, IMPR_RE));
    const kontaktUrlAbs = pickUrl(sitemapUrls, KONTAKT_RE) || abs(n.origin, findLink(html, KONTAKT_RE));

    // Impressum → Kontakt/Rechtsform; wenn dort keine Mail steht, Kontaktseite nachladen.
    let contact = { email: '', rechtsform: '', plz: '', ort: '' };
    if (imprUrlAbs) {
        try { const impr = await fetchText(imprUrlAbs); contact = extractContact(impr.html); } catch { /* egal */ }
    }
    if (!contact.email && kontaktUrlAbs) {
        try { const kon = await fetchText(kontaktUrlAbs); const c = extractContact(kon.html); contact = { ...contact, ...Object.fromEntries(Object.entries(c).filter(([, v]) => v)) }; } catch { /* egal */ }
    }
    if (!contact.email) contact = { ...contact, ...extractContact(html) };

    // Security-Header + Findings.
    const h = home.headers;
    const sec = {
        hsts: !!h.get('strict-transport-security'),
        csp: !!h.get('content-security-policy'),
        xfo: !!h.get('x-frame-options'),
    };
    const findings = [];
    if (platform.version_eol) findings.push({ typ: 'eol_version', schwere: 'hoch', titel: 'Veraltete Shop-Version (EOL)', beschreibung: `${platform.plattform} ohne Sicherheitsupdates — Migrations-Aufhänger.`, beleg_url: n.url, verwendbar_als: 'akquise_aufhaenger' });
    if (!sec.hsts || !sec.csp) findings.push({ typ: 'security', schwere: 'mittel', titel: 'Fehlende Security-Header', beschreibung: `${!sec.hsts ? 'HSTS ' : ''}${!sec.csp ? 'CSP ' : ''}nicht gesetzt.`, beleg_url: n.url, verwendbar_als: 'intern_nur' });

    // Inhouse vs. Agentur: eigene Bundles/GitHub = Inhouse-Indiz; Agentur-Credit = Agentur.
    const inhouseSignal = platform.eigene_namespaces || github_org;
    const team_signal = inhouseSignal ? 'ja' : (agentur_credit ? 'nein' : 'unklar');

    return {
        ok: true,
        company: {
            domain: n.domain, name, rechtsform: contact.rechtsform, plz: contact.plz, ort: contact.ort,
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
