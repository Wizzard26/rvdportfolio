'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    createShare, updateShare, deleteShare, setShareActive,
} from '@/lib/content/sharesStore';

// Server Actions für die Freigaben (Dokument-Sammlungen mit geheimem Link).

function revalidate() {
    revalidatePath('/dashboard/dokumente/freigaben');
}

function parse(formData) {
    return {
        title: (formData.get('title') || '').toString(),
        message: (formData.get('message') || '').toString(),
        is_active: formData.get('is_active') ? 1 : 0,
        documentIds: formData.getAll('document_ids').map((v) => Number(v)).filter(Boolean),
    };
}

export async function createShareAction(prevState, formData) {
    const data = parse(formData);
    if (!data.title.trim()) return { error: 'Titel fehlt', values: data };
    if (data.documentIds.length === 0) return { error: 'Bitte mindestens ein Dokument auswählen.', values: data };
    createShare(data);
    revalidate();
    redirect('/dashboard/dokumente/freigaben');
}

export async function updateShareAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const data = parse(formData);
    if (!data.title.trim()) return { error: 'Titel fehlt', values: { ...data, id } };
    if (data.documentIds.length === 0) return { error: 'Bitte mindestens ein Dokument auswählen.', values: { ...data, id } };
    updateShare(id, data);
    revalidate();
    redirect('/dashboard/dokumente/freigaben');
}

export async function deleteShareAction(formData) {
    deleteShare(Number(formData.get('id')));
    revalidate();
}

export async function toggleShareAction(formData) {
    setShareActive(Number(formData.get('id')), formData.get('active') === '1');
    revalidate();
}
