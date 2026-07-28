'use server';

import { revalidatePath } from 'next/cache';
import {
    addProjectImage, updateProjectImage, getProjectImage,
    deleteProjectImage, reorderProjectImages, setImageAi, setImageAutoplay,
} from '@/lib/content/showcaseImagesStore';
import { saveUploadedImage, saveUploadedVideo, imageAiHint } from '@/lib/content/media';
import { normalizeEmbed } from '@/lib/videoEmbed';

// Server Actions für die Medien eines Showcase-Projekts (media_type 'gallery'/'slider').
// Ein Item ist Bild, hochgeladenes Video oder YouTube/Vimeo-Embed.

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
        addProjectImage({ project_id: projectId, image: link, ai_image: ai, kind: 'image' });
        added += 1;
    }
    if (selected) {
        addProjectImage({ project_id: projectId, image: selected, ai_image: forceAi, kind: 'image' });
        added += 1;
    }
    if (added === 0) return { error: 'Kein Bild ausgewählt oder hochgeladen.' };
    revalidate(projectId);
    return { ok: added };
}

// Kurzes Video hochladen (MP4/WEBM) → eigenes Item (kind='video'), mit KI-Flag
// und Autoplay-Wahl. Für längere/HD-Videos ist der Embed-Weg gedacht.
export async function addProjectVideoAction(prevState, formData) {
    const projectId = Number(formData.get('project_id'));
    if (!projectId) return { error: 'Projekt fehlt' };
    const file = formData.get('video');
    if (!file || typeof file !== 'object' || typeof file.arrayBuffer !== 'function' || !file.size) {
        return { error: 'Keine Videodatei ausgewählt.' };
    }
    let link;
    try { link = await saveUploadedVideo(file); } catch (e) { return { error: e.message }; }
    if (!link) return { error: 'Video konnte nicht gespeichert werden.' };
    addProjectImage({
        project_id: projectId, image: link, kind: 'video',
        ai_image: formData.get('ai_image') != null,
        autoplay: formData.get('autoplay') != null,
    });
    revalidate(projectId);
    return { ok: 1 };
}

// YouTube/Vimeo als Embed-Item (kind='embed'): Provider + Video-ID (oder Link),
// mit KI-Flag und Autoplay-Wahl.
export async function addProjectEmbedAction(prevState, formData) {
    const projectId = Number(formData.get('project_id'));
    if (!projectId) return { error: 'Projekt fehlt' };
    const provider = (formData.get('embed_provider') || 'youtube').toString();
    const norm = normalizeEmbed(provider, formData.get('embed_id'));
    if (!norm) return { error: 'Bitte eine gültige Video-ID oder einen YouTube-/Vimeo-Link eingeben.' };
    addProjectImage({
        project_id: projectId, image: norm, kind: 'embed',
        ai_image: formData.get('ai_image') != null,
        autoplay: formData.get('autoplay') != null,
    });
    revalidate(projectId);
    return { ok: 1 };
}

// Item bearbeiten: KI-Flag, Autoplay und – je nach Art – Quelle ersetzen
// (Bild-Upload/Auswahl, neues Video, geänderter Embed-Link).
export async function updateProjectImageAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const projectId = Number(formData.get('project_id'));
    const item = getProjectImage(id);
    if (!item) return { error: 'Item nicht gefunden' };

    const patch = {
        ai_image: formData.get('ai_image') != null,
        autoplay: formData.get('autoplay') != null,
    };

    try {
        if (item.kind === 'image') {
            const file = formData.get('image');
            if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0) {
                patch.image = await saveUploadedImage(file);
            } else {
                const sel = (formData.get('image_select') || '').toString().trim();
                if (sel) patch.image = sel;
            }
        } else if (item.kind === 'video') {
            const file = formData.get('video');
            if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0) {
                patch.image = await saveUploadedVideo(file);
            }
        } else if (item.kind === 'embed') {
            const provider = (formData.get('embed_provider') || 'youtube').toString();
            const raw = (formData.get('embed_id') || '').toString().trim();
            if (raw) {
                const norm = normalizeEmbed(provider, raw);
                if (!norm) return { error: 'Ungültiger YouTube-/Vimeo-Link bzw. ID.' };
                patch.image = norm;
            }
        }
    } catch (e) {
        return { error: e.message };
    }

    updateProjectImage(id, patch);
    revalidate(projectId);
    return { ok: 1 };
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
    setImageAi(id, formData.get('ai') === '1');
    revalidate(projectId);
}

export async function toggleProjectImageAutoplayAction(formData) {
    const id = Number(formData.get('id'));
    const projectId = Number(formData.get('project_id'));
    setImageAutoplay(id, formData.get('autoplay') === '1');
    revalidate(projectId);
}

export async function reorderProjectImagesAction(projectId, orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderProjectImages(Number(projectId), orderedIds);
    revalidate(Number(projectId));
}
