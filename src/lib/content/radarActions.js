'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    createCompany, updateCompany, deleteCompany, archiveCompany,
    createOpportunity, setOpportunityStatus, deleteOpportunity, rescoreOpportunity,
    addContact, deleteContact, addOutreachBlock, saveFingerprint, createShareFromOpportunity,
    markArt14Sent, getCompany, importCareerJobs,
    parseBuiltWithCsv, importBuiltWith, getCompaniesToRescan, countCompaniesToRescan, applyRescan,
    saveDiscovery, parseDomainList, importDomainList,
    getCompaniesForJobScan, countCompaniesForJobScan, markJobScanned,
} from '@/lib/content/radarStore';
import { fingerprintUrl, scrapeCareerJobs } from '@/lib/content/radarFingerprint';
import { ccDetect } from '@/lib/content/radarCommonCrawl';

// Server Actions für das Bewerbungs-/Akquise-Radar. /dashboard ist per Proxy
// geschützt; Freigabe-Seiten sind force-dynamic → keine Revalidierung nötig.

function companyData(fd) {
    return {
        domain: fd.get('domain'), name: fd.get('name'), rechtsform: fd.get('rechtsform'),
        strasse: fd.get('strasse'), plz: fd.get('plz'), ort: fd.get('ort'), region: fd.get('region'),
        distanz_km: fd.get('distanz_km'), typ: fd.get('typ'), themengebiete: fd.get('themengebiete'),
        inhouse_team: fd.get('inhouse_team'), karriere_url: fd.get('karriere_url'),
        linkedin_url: fd.get('linkedin_url'), github_org: fd.get('github_org'),
        notiz: fd.get('notiz'), aktiv: fd.get('aktiv') ? 1 : 0,
    };
}

export async function createCompanyAction(prevState, formData) {
    const d = companyData(formData);
    if (!d.name && !d.domain) return { error: 'Name oder Domain angeben', values: d };
    const id = createCompany(d);
    revalidatePath('/dashboard/radar');
    redirect(`/dashboard/radar/${id}`);
}

export async function updateCompanyAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const d = companyData(formData);
    if (!d.name && !d.domain) return { error: 'Name oder Domain angeben', values: { ...d, id } };
    updateCompany(id, d);
    revalidatePath('/dashboard/radar');
    redirect(`/dashboard/radar/${id}`);
}

export async function deleteCompanyAction(formData) {
    deleteCompany(Number(formData.get('id')));
    revalidatePath('/dashboard/radar');
    redirect('/dashboard/radar');
}

// Archivieren/Reaktivieren (statt Löschen): Bestand bleibt, raus aus aktiver Sicht.
export async function archiveCompanyAction(formData) {
    const id = Number(formData.get('id'));
    archiveCompany(id, formData.get('on') === '1');
    revalidatePath('/dashboard/radar');
    if (id) revalidatePath(`/dashboard/radar/${id}`);
}

// ── URL scannen (Fingerprinter) ────────────────────────────────────────────

export async function scanUrlAction(prevState, formData) {
    const url = (formData.get('url') || '').toString().trim();
    const typ = (formData.get('typ') || 'inhouse_shop').toString();
    if (!url) return { error: 'Bitte eine URL eingeben.' };

    let result;
    try {
        result = await fingerprintUrl(url);
    } catch {
        return { error: 'Scan fehlgeschlagen. URL prüfen und erneut versuchen.' };
    }
    if (!result.ok) return { error: result.error || 'Konnte nicht ausgewertet werden.' };

    const companyId = saveFingerprint(result, typ);
    revalidatePath('/dashboard/radar');
    return { ok: true, companyId, plattform: result.snapshot.plattform, name: result.company.name };
}

// ── Chancen ──────────────────────────────────────────────────────────────

export async function createOpportunityAction(formData) {
    const companyId = Number(formData.get('company_id'));
    const id = createOpportunity({
        company_id: companyId,
        typ: formData.get('typ'),
        titel: formData.get('titel'),
        quell_url: formData.get('quell_url'),
        quelle: formData.get('quelle'),
        veroeffentlicht_am: formData.get('veroeffentlicht_am'),
        frist: formData.get('frist'),
        stunden_woche: formData.get('stunden_woche'),
        remote_anteil: formData.get('remote_anteil'),
        standort: formData.get('standort'),
        gehalt_angabe: formData.get('gehalt_angabe'),
        stack_erkannt: formData.get('stack_erkannt'),
    });
    rescoreOpportunity(id); // regelbasiertes Scoring direkt berechnen
    revalidatePath(`/dashboard/radar/${companyId}`);
}

export async function setOpportunityStatusAction(formData) {
    const id = Number(formData.get('id'));
    const status = formData.get('status');
    const companyId = Number(formData.get('company_id'));
    setOpportunityStatus(id, status, formData.get('grund') || '');
    // Bei „beworben" die Doppelansprache-Sperre der anderen Pipeline setzen.
    if (status === 'beworben') {
        const pipeline = formData.get('pipeline') || 'bewerbung';
        addOutreachBlock(companyId, pipeline, `Chance #${id} beworben`);
    }
    revalidatePath(`/dashboard/radar/${companyId}`);
    revalidatePath('/dashboard/radar');
}

export async function deleteOpportunityAction(formData) {
    const companyId = Number(formData.get('company_id'));
    deleteOpportunity(Number(formData.get('id')));
    revalidatePath(`/dashboard/radar/${companyId}`);
}

// Discovery: BuiltWith-CSV importieren → Firmen + Kontakte + Tech-Snapshot + Lead-Prio.
export async function importBuiltWithAction(prevState, formData) {
    const file = formData.get('file');
    if (!file || typeof file.text !== 'function' || !file.size) return { error: 'Keine CSV-Datei ausgewählt.' };
    let text = '';
    try { text = await file.text(); } catch { return { error: 'Datei nicht lesbar.' }; }
    const rows = parseBuiltWithCsv(text);
    if (!rows.length) return { error: 'CSV leer oder Header nicht erkannt (Root Domain, eCommerce Platform …).' };
    const res = importBuiltWith(rows);
    revalidatePath('/dashboard/radar');
    return { ok: true, ...res };
}

// Domain-/URL-Liste importieren (z. B. PublicWWW-Marker-Export). Schneller Bulk-
// Import ohne Crawling; der Plattform-Hinweis kommt aus dem gesuchten Marker,
// verifiziert wird per Batch-Re-Scan.
export async function importDomainListAction(prevState, formData) {
    const file = formData.get('file');
    let text = (formData.get('domains') || '').toString();
    if ((!text || !text.trim()) && file && typeof file.text === 'function' && file.size) {
        try { text = await file.text(); } catch { /* ignore */ }
    }
    const domains = parseDomainList(text);
    if (!domains.length) return { error: 'Keine Domains erkannt (Liste/Datei leer?).' };
    const hint = (formData.get('plattform') || '').toString();
    const plattformHint = ['shopware6', 'shopware5', 'shopify'].includes(hint) ? hint : '';
    const res = importDomainList(domains, { plattformHint, source: 'publicwww' });
    revalidatePath('/dashboard/radar');
    return { ok: true, found: domains.length, ...res };
}

// Common-Crawl-Discovery (Prototyp): Domains gegen das CC-Archiv prüfen (ohne die
// Live-Seiten zu belasten) und Shopware/Shopify-Treffer ins Radar importieren.
export async function ccDiscoverAction(prevState, formData) {
    const raw = (formData.get('domains') || '').toString();
    const domains = [...new Set(raw.split(/[\s,;]+/).map((d) => d.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
    if (!domains.length) return { error: 'Keine Domains angegeben.' };
    let checked = 0; let imported = 0; let sw5 = 0; let sw6 = 0; let shopify = 0; let noCopy = 0; let other = 0; let archived = 0;
    const results = [];
    for (const d of domains) {
        checked += 1;
        let det;
        try { det = await ccDetect(d); } catch { det = { ok: false, reason: 'Fehler' }; }
        if (!det.ok) { noCopy += 1; results.push({ domain: d, outcome: det.reason || 'keine Kopie' }); }
        else {
            const plat = det.plattform || 'unbekannt';
            const isTarget = plat.startsWith('shopware') || plat === 'shopify';
            if (!isTarget) { other += 1; results.push({ domain: d, outcome: plat }); }
            else {
                const findings = [];
                if (det.version_eol) findings.push({ typ: 'eol_version', schwere: 'hoch', titel: 'Shopware 5 (EOL)', beschreibung: 'Aus Common-Crawl-Archiv als Shopware 5 erkannt — Migrations-Aufhänger; per Re-Scan live verifizieren.', beleg_url: `https://${d}`, verwendbar_als: 'akquise_aufhaenger' });
                const id = saveDiscovery(d, det, findings, 'commoncrawl');
                if (!id) { archived += 1; results.push({ domain: d, outcome: 'archiviert (übersprungen)' }); }
                else {
                    imported += 1;
                    if (plat === 'shopware5') sw5 += 1; else if (plat === 'shopware6') sw6 += 1; else if (plat === 'shopify') shopify += 1;
                    results.push({ domain: d, outcome: `${plat}${det.version ? ` ${det.version}` : ''}` });
                }
            }
        }
        await new Promise((res) => setTimeout(res, 250));
    }
    revalidatePath('/dashboard/radar');
    return { ok: true, checked, imported, sw5, sw6, shopify, noCopy, other, archived, results };
}

// Batch-Re-Scan: pro Aufruf ein Häppchen Domains live fingerprinten (gedrosselt,
// robots-konform) und die Realität korrigieren. Client ruft in Schleife auf.
export async function rescanBatchAction(prevState, formData) {
    const limit = Math.min(8, Math.max(1, Number(formData.get('limit')) || 5));
    const mode = formData.get('mode') === 'all' ? 'all' : 'unscanned';
    const targets = getCompaniesToRescan({ limit, mode });
    const results = [];
    for (const t of targets) {
        let fp;
        try { fp = await fingerprintUrl(`https://${t.domain}`); } catch { fp = { ok: false }; }
        const r = applyRescan(t.id, fp);
        results.push({ domain: t.domain, outcome: r.outcome, plattform: r.plattform || '' });
        await new Promise((res) => setTimeout(res, 400)); // höflich zwischen den Domains
    }
    revalidatePath('/dashboard/radar');
    return { ok: true, scanned: results.length, remaining: countCompaniesToRescan(mode), results };
}

// Feature 2: Batch-Karriereseiten-Scan — sammelt Shopware-Stellen aus den eigenen
// Karriereseiten der Firmen (legitim, keine Portale/BA) als Job-Chancen. Häppchen.
export async function jobScanBatchAction(prevState, formData) {
    const limit = Math.min(8, Math.max(1, Number(formData.get('limit')) || 5));
    const targets = getCompaniesForJobScan({ limit });
    const results = [];
    let jobsAdded = 0;
    for (const t of targets) {
        let res = { ok: false, jobs: [] };
        try { res = await scrapeCareerJobs(t.karriere_url); } catch { /* egal */ }
        let added = 0;
        if (res.ok && res.jobs && res.jobs.length) { added = importCareerJobs(t.id, res.jobs).added; jobsAdded += added; }
        markJobScanned(t.id);
        results.push({ id: t.id, added, found: (res.jobs && res.jobs.length) || 0, widget: res.widget || '' });
        await new Promise((r) => setTimeout(r, 400));
    }
    revalidatePath('/dashboard/radar');
    return { ok: true, scanned: results.length, jobsAdded, remaining: countCompaniesForJobScan(), results };
}

// Phase 3A: Stellen von der Karriereseite der Firma ziehen und als Chancen anlegen.
export async function scrapeCareerJobsAction(prevState, formData) {
    const companyId = Number(formData.get('company_id'));
    const company = getCompany(companyId);
    if (!company) return { error: 'Firma nicht gefunden.' };
    if (!company.karriere_url) return { error: 'Keine Karriere-URL hinterlegt — erst scannen oder in „Bearbeiten" setzen.' };
    const res = await scrapeCareerJobs(company.karriere_url);
    if (!res.ok) return { error: res.error };
    const { added, skipped } = importCareerJobs(companyId, res.jobs);
    revalidatePath(`/dashboard/radar/${companyId}`);
    return { ok: true, found: res.jobs.length, added, skipped, source: res.source, widget: res.widget };
}

// One-Click: Chance → vorbefüllte Freigabe (Anschreiben + Token-Link) und direkt
// zur Freigabe-Bearbeitung springen, wo René sie feinschleift und teilt.
export async function createFreigabeFromOpportunityAction(formData) {
    const oppId = Number(formData.get('id'));
    const companyId = Number(formData.get('company_id'));
    const res = createShareFromOpportunity(oppId);
    revalidatePath(`/dashboard/radar/${companyId}`);
    if (!res) redirect(`/dashboard/radar/${companyId}`);
    redirect(`/dashboard/dokumente/freigaben/${res.id}`);
}

// ── Kontakte ─────────────────────────────────────────────────────────────

export async function addContactAction(formData) {
    const companyId = Number(formData.get('company_id'));
    addContact({
        company_id: companyId, name: formData.get('name'), rolle: formData.get('rolle'),
        email: formData.get('email'), telefon: formData.get('telefon'),
        linkedin_url: formData.get('linkedin_url'), ist_entscheider: formData.get('ist_entscheider') ? 1 : 0,
        quelle: formData.get('quelle'),
    });
    revalidatePath(`/dashboard/radar/${companyId}`);
}

export async function deleteContactAction(formData) {
    const companyId = Number(formData.get('company_id'));
    deleteContact(Number(formData.get('id')));
    if (companyId) revalidatePath(`/dashboard/radar/${companyId}`);
    revalidatePath('/dashboard/radar'); // DSGVO-Löschliste in der Übersicht aktualisieren
}

// Art. 14 DSGVO: Erstkontakt-Info als gesendet/offen markieren.
export async function markArt14SentAction(formData) {
    const companyId = Number(formData.get('company_id'));
    markArt14Sent(Number(formData.get('id')), formData.get('sent') === '1');
    if (companyId) revalidatePath(`/dashboard/radar/${companyId}`);
}
