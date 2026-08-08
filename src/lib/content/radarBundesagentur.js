// Bundesagentur-für-Arbeit-Jobsuche (offizielle öffentliche API, dokumentiert bei
// bundesAPI/jobsuche-api). Auth: Header X-API-Key: jobboerse-jobsuche. Endpoint v6.
// Maßvoll nutzen (wenige Suchen) — die BA sieht massenhafte Auswertung kritisch.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const HEADERS = { 'X-API-Key': 'jobboerse-jobsuche', accept: 'application/json', 'accept-language': 'de-DE,de;q=0.9', 'user-agent': UA };
const BASE = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs';

// Suche → normalisierte Job-Liste. `wo` (Ort/PLZ) + `umkreis` (km) optional.
export async function searchArbeitsagentur({ was = 'Shopware', wo = '', umkreis = '', size = 50, page = 1 } = {}) {
    const p = new URLSearchParams({ was, size: String(Math.min(100, Math.max(1, Number(size) || 50))), page: String(Math.max(1, Number(page) || 1)) });
    if (wo) p.set('wo', wo);
    if (wo && umkreis) p.set('umkreis', String(Number(umkreis) || 25));
    let res;
    try { res = await fetch(`${BASE}?${p.toString()}`, { headers: HEADERS }); }
    catch { return { ok: false, error: 'Bundesagentur nicht erreichbar.' }; }
    if (!res.ok) return { ok: false, error: `Bundesagentur-API antwortete ${res.status}.` };
    let d;
    try { d = await res.json(); } catch { return { ok: false, error: 'Antwort nicht lesbar.' }; }
    const jobs = (d.ergebnisliste || []).map((j) => {
        const a = (j.stellenlokationen && j.stellenlokationen[0] && j.stellenlokationen[0].adresse) || {};
        const ref = j.referenznummer || '';
        return {
            titel: (j.stellenangebotsTitel || j.beruf || '').trim(),
            firma: (j.firma || '').trim(),
            ort: (a.ort || '').trim(), plz: (a.plz || '').trim(), region: (a.region || '').trim(),
            referenznummer: ref,
            url: j.externeURL || (ref ? `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(ref)}` : ''),
            veroeffentlicht: j.datumErsteVeroeffentlichung || '',
        };
    });
    return { ok: true, total: d.maxErgebnisse ?? jobs.length, jobs };
}
