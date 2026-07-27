'use server';

import { revalidatePath } from 'next/cache';
import {
    addProjectImage, deleteProjectImage, reorderProjectImages, setImageAi,
} from '@/lib/content/showcaseImagesStore';
import { saveUploadedImage, imageAiHint } from '@/lib/content/media';

// Server Actions für die Bilder eines Showcase-Projekts (media_type 'gallery'/'slider').

function revalidate(projectId) {
    revalidatePath('/showcase');
    if (projectId) revalidatePath(`/dashboard/showcase/${projectId}`);
}

// Mehrere Bilder auf einmal hinzufügen (Upload und/oder vorhandenes Bild).
// KI-Kennzeichnung je Bild: manueller Haken für den Stapel ODER Metadaten-Hinweis.
export async function addProjectImagesAction(prevState, formData) {
    const projectId = Number(formData.get('project_id'));
    if (!projectId) return { error: 'Projekt fehlt' };

    const forceAi = formData.get('ai_image') != null;
    const files = formData.getAll('images').filter(
        (f) => f && typeof f === 'object' && typeof f.arrayBuffer === 'function' && f.size > 0,
    );
    const selected = (formData.get('image_select') || '').toString().trim();

    let added = 0;
    for (const file of files) {
        let link;
        try { link = await saveUploadedImage(file); } catch (e) { return { error: e.message }; }
        if (!link) continue;
        const ai = forceAi || await imageAiHint(file);
        addProjectImage({ project_id: projectId, image: link, ai_image: ai });
        added += 1;
    }
    if (selected) {
        addProjectImage({ project_id: projectId, image: selected, ai_image: forceAi });
        added += 1;
    }
    if (added === 0) return { error: 'Kein Bild ausgewählt oder hochgeladen.' };
    revalidate(projectId);
    return { ok: added };
}

export async function deleteProjectImageAction(formData) {
    const id = Number(formData.get('id'));
    const projectId = Number(formData.get('project_id'));
    deleteProjectImage(id);
    revalidate(projectId);
}

export async function toggleProjectImageAiAction(formData) {
    const id = Number(formData.get('id'));
    const projectId = Number(formData.get('project_id'));
    const ai = formData.get('ai') === '1';
    setImageAi(id, ai);
    revalidate(projectId);
}

export async function reorderProjectImagesAction(projectId, orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderProjectImages(Number(projectId), orderedIds);
    revalidate(Number(projectId));
}
