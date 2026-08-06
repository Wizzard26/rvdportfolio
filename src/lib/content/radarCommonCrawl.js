// Common-Crawl-Discovery (Prototyp). Liest die Plattform einer Domain aus dem
// öffentlichen Common-Crawl-Archiv — OHNE die Live-Seite zu belasten:
//   1. CC-Index-Server nach der (neuesten) Startseiten-Kopie fragen
//   2. WARC-Datensatz per HTTP-Range holen, gunzip, HTML extrahieren
//   3. unseren detectPlatform() drüberlaufen lassen
// Grenzen (ehrlich): CC archiviert HTML-Seiten (nicht die Asset-URLs), der Korpus
// ist nicht vollständig/aktuell, und headless/CDN-Shops ohne HTML-Marker rutschen
// durch. Für echte Massen-Enumeration → CC-Columnar-Index (Athena) mit
// Marker-Query (siehe ATHENA_HINT), dessen Domain-Export der CSV-Import frisst.
import zlib from 'node:zlib';
import { detectPlatform } from './radarFingerprint';

const UA = 'Mozilla/5.0 (compatible; RvdRadar/1.0; +https://rene-van-dinter.de)';
const TIMEOUT_MS = 15000;
const MAX_BYTES = 3_000_000;

export const ATHENA_HINT =
    "SELECT url_host_registered_domain FROM ccindex WHERE crawl='CC-MAIN-2026-30' "
    + "AND subset='warc' AND url LIKE '%/bundles/storefront/%' GROUP BY 1;";

let cachedApi = null;
async function latestIndexApi() {
    if (cachedApi) return cachedApi;
    const res = await fetch('https://index.commoncrawl.org/collinfo.json', { headers: { 'user-agent': UA } });
    const coll = await res.json();
    cachedApi = coll[0]['cdx-api']; // neuester Crawl
    return cachedApi;
}

async function fetchWithTimeout(url, opts = {}) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try { return await fetch(url, { ...opts, signal: ctrl.signal, headers: { 'user-agent': UA, ...(opts.headers || {}) } }); }
    finally { clearTimeout(t); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Startseiten-Datensatz aus dem CC-Index (neueste, status 200, text/html).
// Der öffentliche CC-Index-Server ist oft überlastet (504/503) → Retry mit Backoff.
// Rückgabe: { rec } bei Erfolg, { rec: null } wenn nichts gefunden, { busy: true }
// wenn der Index-Server nicht antwortet.
async function indexLookup(domain) {
    const api = await latestIndexApi();
    const url = `${api}?url=${encodeURIComponent(domain)}&output=json&filter=status:200&filter=mime:text/html&limit=8`;
    for (let attempt = 0; attempt < 3; attempt += 1) {
        let res;
        try { res = await fetchWithTimeout(url); } catch { await sleep(1200 * (attempt + 1)); continue; }
        if (res.status === 200) {
            const recs = (await res.text()).trim().split('\n').filter(Boolean)
                .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
            if (!recs.length) return { rec: null };
            recs.sort((a, b) => (a.url.length - b.url.length) || (Number(b.timestamp) - Number(a.timestamp)));
            return { rec: recs[0] };
        }
        if ([429, 500, 502, 503, 504].includes(res.status)) { await res.text().catch(() => {}); await sleep(1200 * (attempt + 1)); continue; }
        return { rec: null };
    }
    return { busy: true };
}

// WARC-Range holen und den HTML-Body + HTTP-Header extrahieren.
async function fetchArchived(rec) {
    const off = Number(rec.offset); const len = Number(rec.length);
    if (!Number.isFinite(off) || !Number.isFinite(len) || len > MAX_BYTES) return null;
    let res;
    try { res = await fetchWithTimeout(`https://data.commoncrawl.org/${rec.filename}`, { headers: { Range: `bytes=${off}-${off + len - 1}` } }); }
    catch { return null; }
    if (res.status !== 206 && res.status !== 200) return null;
    let raw;
    try { raw = zlib.gunzipSync(Buffer.from(await res.arrayBuffer())).toString('latin1'); }
    catch { return null; }
    // WARC-Header \r\n\r\n HTTP-Header \r\n\r\n HTML
    const i = raw.indexOf('\r\n\r\n');
    const j = raw.indexOf('\r\n\r\n', i + 4);
    if (i < 0 || j < 0) return null;
    const httpHead = raw.slice(i + 4, j);
    const html = raw.slice(j + 4);
    const server = (httpHead.match(/^server:\s*(.+)$/im) || [])[1] || '';
    const headers = { get: (k) => (k.toLowerCase() === 'server' ? server.trim() : '') };
    return { html, headers, ts: rec.timestamp };
}

// Plattform einer Domain aus dem CC-Archiv ableiten.
export async function ccDetect(domain) {
    const look = await indexLookup(domain);
    if (look.busy) return { ok: false, reason: 'CC-Index überlastet' };
    if (!look.rec) return { ok: false, reason: 'keine CC-Kopie' };
    const arc = await fetchArchived(look.rec);
    if (!arc || !arc.html) return { ok: false, reason: 'Archiv nicht lesbar' };
    const p = detectPlatform(arc.html, arc.headers);
    return {
        ok: true,
        plattform: p.plattform, plattform_confidence: p.plattform_confidence, version: p.version,
        version_eol: p.version_eol, frontend: p.frontend, archived_at: arc.ts,
        belege: JSON.stringify([...(p.belege || []), { signal: 'Common Crawl', beleg: `archiviert ${arc.ts}` }]),
    };
}
