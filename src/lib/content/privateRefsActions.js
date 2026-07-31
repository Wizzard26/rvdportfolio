'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    createPrivateRef, updatePrivateRef, deletePrivateRef, reorderPrivateRefs, setPrivateRefActive,
    addRefImage, getRefImage, updateRefImage, deleteRefImage, setRefImageAi, reorderRefImages,
} from '@/lib/content/privateRefsStore';
import { saveUploadedImage, imageAiHint } from '@/lib/content/media';

// Server Actions für die vertraulichen Referenzen (Text-CRUD + Screenshots).
// Der Proxy schützt bereits alle /dashboard-Requests (wie bei den übrigen
// Inhalts-Actions). Freigabe-Seiten sind force-dynamic → keine Revalidierung nötig.

const BASE = '/dashboard/vertrauliche-referenzen';

function revalidate(refId) {
    revalidatePath(BASE);
    if (refId) revalidatePath(`${BASE}/${refId}`);
}

function parse(formData) {
    return {
        title: (formData.get('title') || '').toString().trim(),
        context: (formData.get('context') || '').toString().trim(),
        description: (formData.get('description') || '').toString().trim(),
        tech: (formData.get('tech') || '').toString().trim(),
        status: (formData.get('status') || 'live').toString(),
        link: (formData.get('link') || '').toString().trim(),
        link_label: (formData.get('link_label') || '').toString().trim(),
        is_active: formData.get('is_active') ? 1 : 0,
    };
}

export async function createPrivateRefAction(prevState, formData) {
    const data = parse(formData);
    if (!data.title) return { error: 'Titel fehlt', values: data };
    createPrivateRef(data);
    revalidate();
    redirect(BASE);
}

export async function updatePrivateRefAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const data = parse(formData);
    if (!data.title) return { error: 'Titel fehlt', values: { ...data, id } };
    updatePrivateRef(id, data);
    revalidate(id);
    redirect(BASE);
}

export async function deletePrivateRefAction(formData) {
    deletePrivateRef(Number(formData.get('id')));
    revalidate();
}

export async function togglePrivateRefAction(formData) {
    setPrivateRefActive(Number(formData.get('id')), formData.get('active') === '1');
    revalidate();
}

export async function reorderPrivateRefsAction(orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderPrivateRefs(orderedIds);
    revalidate();
}

// ─── Screenshots ──────────────────────────────────────────────────────────

// Mehrere Screenshots auf einmal hochladen. KI je Bild: manueller Haken für den
// Stapel ODER automatischer Metadaten-Hinweis (imageAiHint).
export async function addRefImagesAction(prevState, formData) {
    const refId = Number(formData.get('ref_id'));
    if (!refId) return { error: 'Referenz fehlt' };

    const forceAi = formData.get('ai_image') != null;
    const files = formData.getAll('images').filter(
        (f) => f && typeof f === 'object' && typeof f.arrayBuffer === 'function' && f.size > 0,
    );

    let added = 0;
    for (const file of files) {
        let link;
        try { link = await saveUploadedImage(file); } catch (e) { return { error: e.message }; }
        if (!link) continue;
        const ai = forceAi || await imageAiHint(file);
        addRefImage({ ref_id: refId, image: link, ai_image: ai });
        added += 1;
    }
    if (added === 0) return { error: 'Kein Bild hochgeladen.' };
    revalidate(refId);
    return { ok: added };
}

export async function updateRefImageAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const refId = Number(formData.get('ref_id'));
    const item = getRefImage(id);
    if (!item) return { error: 'Bild nicht gefunden' };

    const patch = { ai_image: formData.get('ai_image') != null };
    const file = formData.get('image');
    if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0) {
        try { patch.image = await saveUploadedImage(file); } catch (e) { return { error: e.message }; }
    }
    updateRefImage(id, patch);
    revalidate(refId);
    return { ok: 1 };
}

export async function deleteRefImageAction(formData) {
    const refId = Number(formData.get('ref_id'));
    deleteRefImage(Number(formData.get('id')));
    revalidate(refId);
}

export async function toggleRefImageAiAction(formData) {
    const refId = Number(formData.get('ref_id'));
    setRefImageAi(Number(formData.get('id')), formData.get('ai') === '1');
    revalidate(refId);
}

export async function reorderRefImagesAction(refId, orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderRefImages(Number(refId), orderedIds);
    revalidate(Number(refId));
}
