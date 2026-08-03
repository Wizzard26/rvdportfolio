'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    createCompany, updateCompany, deleteCompany,
    createOpportunity, setOpportunityStatus, deleteOpportunity, rescoreOpportunity,
    addContact, deleteContact, addOutreachBlock, saveFingerprint, createShareFromOpportunity,
    markArt14Sent,
} from '@/lib/content/radarStore';
import { fingerprintUrl } from '@/lib/content/radarFingerprint';

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
