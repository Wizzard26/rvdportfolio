'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    createProject, updateProject, deleteProject, reorderProjects,
} from '@/lib/content/showcaseStore';
import { saveUploadedImage } from '@/lib/content/media';

// Server Actions für die Showcase-Projekte.

const COMPONENTS = new Set(['CallEvent', 'WebPage']); // Whitelist interaktiver Slots
const CATEGORIES = new Set(['shopware', 'react']);
const VARIANTS = new Set(['full', 'compact']);

function revalidate() {
    revalidatePath('/showcase');
    revalidatePath('/dashboard/showcase');
}

// Bestimmt das Medium je nach Typ: Bild (Upload hat Vorrang vor Auswahl),
// Video-Pfad oder Whitelist-Komponente.
async function resolveMedia(formData, mediaType) {
    if (mediaType === 'image') {
        const file = formData.get('image');
        if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0) {
            return await saveUploadedImage(file); // kann werfen
        }
        return (formData.get('image_select') || '').toString();
    }
    if (mediaType === 'video') return (formData.get('video_path') || '').toString();
    if (mediaType === 'component') {
        const c = (formData.get('component') || '').toString();
        return COMPONENTS.has(c) ? c : '';
    }
    return '';
}

function parseCommon(formData) {
    const category = (formData.get('category') || 'shopware').toString();
    const variant = (formData.get('variant') || 'full').toString();
    return {
        category: CATEGORIES.has(category) ? category : 'shopware',
        variant: VARIANTS.has(variant) ? variant : 'full',
        name: (formData.get('name') || '').toString().trim(),
        headline: (formData.get('headline') || '').toString().trim(),
        intro: (formData.get('intro') || '').toString(),
        features: (formData.get('features') || '').toString(),
        tech: (formData.get('tech') || '').toString(),
        schema_type: (formData.get('schema_type') || '').toString(),
        application_category: (formData.get('application_category') || '').toString().trim(),
        media_type: (formData.get('media_type') || 'none').toString(),
    };
}

export async function createProjectAction(prevState, formData) {
    const data = parseCommon(formData);
    if (!data.name) return { error: 'Titel fehlt', values: data };
    let media;
    try { media = await resolveMedia(formData, data.media_type); } catch (e) { return { error: e.message, values: data }; }
    createProject({ ...data, media });
    revalidate();
    redirect('/dashboard/showcase');
}

export async function updateProjectAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const data = parseCommon(formData);
    if (!data.name) return { error: 'Titel fehlt', values: { ...data, id } };
    let media;
    try { media = await resolveMedia(formData, data.media_type); } catch (e) { return { error: e.message, values: { ...data, id } }; }
    // Kein neuer Upload & keine Auswahl bei image → vorhandenes Medium behalten.
    if (data.media_type === 'image' && !media) {
        media = (formData.get('current_media') || '').toString();
    }
    updateProject(id, { ...data, media });
    revalidate();
    redirect('/dashboard/showcase');
}

export async function deleteProjectAction(formData) {
    deleteProject(Number(formData.get('id')));
    revalidate();
}

export async function reorderProjectsAction(category, orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderProjects(category, orderedIds);
    revalidate();
}
