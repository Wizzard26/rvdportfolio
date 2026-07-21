'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    createDocument, updateDocument, deleteDocument, reorderDocuments, setDocumentActive,
    VITA_SETTING_KEY, VITA_TEXT_KEY,
} from '@/lib/content/documentsStore';
import { setSetting } from '@/lib/content/settingsStore';
import { saveUploadedPdf } from '@/lib/content/documents';

// Server Actions für den Dokumente-Bereich.

function revalidate() {
    revalidatePath('/dashboard/dokumente');
    revalidatePath('/vita'); // der Vita-Download-Button liest ein Dokument
}

// Datei bestimmen: hochgeladene PDF hat Vorrang vor der Auswahl aus der Liste.
async function resolveFile(formData) {
    const file = formData.get('file');
    if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0) {
        return await saveUploadedPdf(file); // wirft bei ungültiger Datei
    }
    return (formData.get('file_select') || '').toString();
}

function parseCommon(formData) {
    return {
        title: (formData.get('title') || '').toString().trim(),
        slug: (formData.get('slug') || '').toString(),
        is_active: formData.get('is_active') ? 1 : 0,
    };
}

export async function createDocumentAction(prevState, formData) {
    const data = parseCommon(formData);
    if (!data.title) return { error: 'Titel fehlt', values: data };
    let file;
    try { file = await resolveFile(formData); } catch (e) { return { error: e.message, values: data }; }
    if (!file) return { error: 'Bitte eine PDF hochladen oder auswählen.', values: data };
    createDocument({ ...data, file });
    revalidate();
    redirect('/dashboard/dokumente');
}

export async function updateDocumentAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const data = parseCommon(formData);
    if (!data.title) return { error: 'Titel fehlt', values: { ...data, id } };
    let file;
    try { file = await resolveFile(formData); } catch (e) { return { error: e.message, values: { ...data, id } }; }
    if (!file) file = (formData.get('current_file') || '').toString(); // nichts Neues → behalten
    updateDocument(id, { ...data, file });
    revalidate();
    redirect('/dashboard/dokumente');
}

export async function deleteDocumentAction(formData) {
    deleteDocument(Number(formData.get('id')));
    revalidate();
}

export async function toggleDocumentAction(formData) {
    setDocumentActive(Number(formData.get('id')), formData.get('active') === '1');
    revalidate();
}

export async function reorderDocumentsAction(orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderDocuments(orderedIds);
    revalidate();
}

// Legt fest, welches Dokument der Vita-Button verwendet und wie er beschriftet ist.
export async function setVitaDocumentAction(formData) {
    setSetting(VITA_SETTING_KEY, (formData.get('document_id') || '').toString());
    setSetting(VITA_TEXT_KEY, (formData.get('button_text') || '').toString().trim());
    revalidate();
}
