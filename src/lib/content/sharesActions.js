'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
    createShare, updateShare, deleteShare, setShareActive, getShareByToken, normalizeCode, shareCookieName,
} from '@/lib/content/sharesStore';

// Server Actions für die Freigaben (Dokument-Sammlungen mit geheimem Link).

function revalidate() {
    revalidatePath('/dashboard/dokumente/freigaben');
}

function parse(formData) {
    const g = (k) => (formData.get(k) || '').toString();
    return {
        title: g('title'),
        message: g('message'),
        purpose: g('purpose'),
        company: g('company'),
        street: g('street'),
        zip: g('zip'),
        city: g('city'),
        contact: g('contact'),
        position: g('position'),
        access_code: g('access_code'),
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

// Öffentliches PLZ-Gate: prüft den Code gegen die hinterlegte PLZ und setzt bei
// Erfolg ein Cookie, das die Freigabe-Seite freischaltet.
export async function unlockShareAction(formData) {
    const token = (formData.get('token') || '').toString();
    const code = (formData.get('code') || '').toString();
    const share = getShareByToken(token);
    if (share && share.access_code && normalizeCode(code) === normalizeCode(share.access_code)) {
        (await cookies()).set(shareCookieName(share.id), '1', {
            httpOnly: true, sameSite: 'lax', path: `/freigabe/${token}`, maxAge: 60 * 60 * 24 * 7,
        });
        redirect(`/freigabe/${token}`);
    }
    redirect(`/freigabe/${token}?gate=1`);
}
