// Stellen-Check: Prüft, ob die im Radar erfassten Stellenanzeigen noch online
// sind. Quellen nach Verlässlichkeit:
//   1. Bundesagentur-Anzeigen → offizielle Detail-API (404 = entfernt).
//   2. Stellen von der Karriereseite der Firma → Karriereseite neu auslesen und
//      den Titel suchen; zusätzlich die Stellen-URL selbst (404/410 = entfernt).
// Fremde Jobportal-Links werden bewusst NICHT abgerufen (kein Portal-Scraping);
// sie landen als „unklar" in der Liste. Erfindet nichts: ohne klares Signal
// bleibt das Ergebnis „unklar" und die Chance unverändert.

import { checkBaJobOnline, refnrFromUrl } from './radarBundesagentur';
import { checkUrlStatus, scrapeCareerJobs, normalizeUrl } from './radarFingerprint';

// Titel vergleichbar machen: Kleinschreibung, ohne (m/w/d)-Zusätze und Satzzeichen.
export function normTitle(t) {
    return (t || '').toLowerCase()
        .replace(/\(\s*[mwdfx]\s*(?:[/|,]\s*[mwdfx*]\s*)+\)/g, ' ')
        .replace(/[^a-z0-9äöüß]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function titleListed(titel, jobs) {
    const t = normTitle(titel);
    if (!t) return false;
    return jobs.some((j) => {
        const o = normTitle(j.titel);
        return o && (o === t || (o.length >= 12 && t.includes(o)) || (t.length >= 12 && o.includes(t)));
    });
}

function hostOf(url) {
    return normalizeUrl(url)?.domain || '';
}

function samePage(a, b) {
    const na = normalizeUrl(a); const nb = normalizeUrl(b);
    if (!na || !nb) return false;
    const strip = (u) => u.url.replace(/[?#].*$/, '').replace(/\/+$/, '').replace(/^https?:\/\/(www\.)?/, '');
    return strip(na) === strip(nb);
}

// Eine Firma prüfen → [{ id, state, info }].
export async function checkCompanyJobs(company, opps) {
    const results = [];
    const ownHosts = new Set([company.domain, hostOf(company.karriere_url)].filter(Boolean));
    let career; // lazy: Karriereseite nur einmal je Firma abrufen

    const getCareer = async () => {
        if (career !== undefined) return career;
        if (!company.karriere_url) { career = null; return career; }
        try { career = await scrapeCareerJobs(company.karriere_url); } catch { career = { ok: false }; }
        return career;
    };

    for (const o of opps) {
        // 1) Bundesagentur
        const refnr = o.ba_refnr || refnrFromUrl(o.quell_url);
        if (refnr) {
            results.push({ id: o.id, ...(await checkBaJobOnline(refnr)) });
            await new Promise((r) => setTimeout(r, 250));
            continue;
        }

        const host = hostOf(o.quell_url);
        if (!host || !ownHosts.has(host)) {
            results.push({ id: o.id, state: 'unklar', info: 'Externer Portal-Link ohne BA-Referenz — wird nicht automatisch abgerufen.' });
            continue;
        }

        // 2) Eigene Stellen-URL der Firma
        const url = await checkUrlStatus(o.quell_url);
        if (url.ok && (url.status === 404 || url.status === 410)) {
            results.push({ id: o.id, state: 'offline', info: `Stellen-URL liefert ${url.status}.` });
            continue;
        }
        const isOverview = samePage(o.quell_url, company.karriere_url);
        const redirectedAway = url.ok && url.status < 400 && !isOverview && !samePage(o.quell_url, url.finalUrl)
            && (new URL(url.finalUrl).pathname.replace(/\/+$/, '') === '' || samePage(url.finalUrl, company.karriere_url));
        if (redirectedAway) {
            results.push({ id: o.id, state: 'offline', info: 'Stellen-URL leitet auf Start-/Karriere-Übersicht um.' });
            continue;
        }

        // 3) Karriereseite neu auslesen
        const c = await getCareer();
        if (c && c.ok && c.jobs.length) {
            if (titleListed(o.titel, c.jobs)) {
                results.push({ id: o.id, state: 'online', info: 'Auf der Karriereseite gelistet.' });
            } else if (!isOverview && url.ok && url.status === 200) {
                results.push({ id: o.id, state: 'unklar', info: 'Nicht mehr in der Karriere-Übersicht, Detailseite aber erreichbar.' });
            } else {
                results.push({ id: o.id, state: 'offline', info: `Nicht mehr auf der Karriereseite gelistet (${c.jobs.length} andere Stellen gefunden).` });
            }
            continue;
        }
        if (c && c.ok && !c.jobs.length && !c.widget && o.quelle === 'karriereseite') {
            // Die Stelle stammte von genau dieser Seite — jetzt listet sie keine mehr.
            results.push({ id: o.id, state: 'offline', info: 'Karriereseite listet keine Stellen mehr.' });
            continue;
        }
        if (url.ok && url.status === 200 && !isOverview) {
            results.push({ id: o.id, state: 'online', info: 'Stellen-URL erreichbar.' });
            continue;
        }
        results.push({ id: o.id, state: 'unklar', info: c && c.widget ? `Stellen laden per ${c.widget} — nicht prüfbar.` : (url.error || c?.error || 'Kein eindeutiges Signal.') });
    }
    return results;
}
