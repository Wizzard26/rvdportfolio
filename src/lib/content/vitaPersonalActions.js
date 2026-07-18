'use server';

import { revalidatePath } from 'next/cache';
import {
    createArea, updateArea, deleteArea, reorderAreas,
    createEntry, updateEntry, deleteEntry, reorderEntries,
} from '@/lib/content/vitaPersonalStore';
import { saveUploadedPdf } from '@/lib/content/documents';

// Server Actions für die persönlichen Vita-Daten (Bereiche + Einträge).
// Alle Änderungen revalidieren die öffentliche /vita und die Admin-Seite.

function revalidate() {
    revalidatePath('/vita');
    revalidatePath('/dashboard/vita/personal');
}

// Ermittelt den PDF-Link: neu hochgeladene Datei hat Vorrang, sonst die
// Dropdown-Auswahl (die beim Bearbeiten auf den aktuellen Link vorbelegt ist),
// sonst kein Link.
async function resolveLink(formData) {
    const pdf = formData.get('pdf');
    if (pdf && typeof pdf === 'object' && typeof pdf.arrayBuffer === 'function' && pdf.size > 0) {
        return await saveUploadedPdf(pdf); // kann werfen (Typ/Größe)
    }
    const selected = (formData.get('link') || '').toString();
    return selected || null;
}

// ── Bereiche ──────────────────────────────────────────────────────────────

export async function createAreaAction(prevState, formData) {
    const title = (formData.get('title') || '').toString().trim();
    createArea({ title, show_headline: !!formData.get('show_headline') });
    revalidate();
    return { ok: true };
}

export async function updateAreaAction(prevState, formData) {
    updateArea(Number(formData.get('id')), {
        title: (formData.get('title') || '').toString().trim(),
        show_headline: !!formData.get('show_headline'),
    });
    revalidate();
    return { ok: true };
}

export async function deleteAreaAction(formData) {
    deleteArea(Number(formData.get('id')));
    revalidate();
}

export async function reorderAreasAction(orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderAreas(orderedIds);
    revalidate();
}

// ── Einträge ──────────────────────────────────────────────────────────────

export async function createEntryAction(prevState, formData) {
    const areaId = Number(formData.get('area_id'));
    const text = (formData.get('text') || '').toString().trim();
    if (!text) return { error: 'Text fehlt' };

    let link;
    try { link = await resolveLink(formData); } catch (e) { return { error: e.message }; }

    createEntry(areaId, { text, link });
    revalidate();
    return { ok: true };
}

export async function updateEntryAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const text = (formData.get('text') || '').toString().trim();
    if (!text) return { error: 'Text fehlt' };

    let link;
    try { link = await resolveLink(formData); } catch (e) { return { error: e.message }; }

    updateEntry(id, { text, link });
    revalidate();
    return { ok: true };
}

export async function deleteEntryAction(formData) {
    deleteEntry(Number(formData.get('id')));
    revalidate();
}

export async function reorderEntriesAction(areaId, orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderEntries(Number(areaId), orderedIds);
    revalidate();
}
