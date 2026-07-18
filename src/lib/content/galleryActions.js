'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    createGalleryItem, updateGalleryItem, deleteGalleryItem, reorderGalleryItems, setGalleryItemActive, GALLERIES,
} from '@/lib/content/galleryStore';
import { saveUploadedImage } from '@/lib/content/media';

// Server Actions für die Design-Galerien.

function revalidate() {
    revalidatePath('/showcase');
    revalidatePath('/dashboard/showcase/galerien');
}

// Bild: hochgeladene Datei hat Vorrang vor der Auswahl aus der Liste.
async function resolveImage(formData) {
    const file = formData.get('image');
    if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0) {
        return await saveUploadedImage(file); // kann werfen
    }
    return (formData.get('image_select') || '').toString();
}

function parseCommon(formData) {
    const gallery = (formData.get('gallery') || 'ecommerce').toString();
    return {
        gallery: GALLERIES.includes(gallery) ? gallery : 'ecommerce',
        title: (formData.get('title') || '').toString().trim(),
        description: (formData.get('description') || '').toString(),
        technik: (formData.get('technik') || '').toString().trim(),
        is_active: formData.get('is_active') ? 1 : 0,
    };
}

export async function createGalleryItemAction(prevState, formData) {
    const data = parseCommon(formData);
    if (!data.title) return { error: 'Titel fehlt', values: data };
    let image;
    try { image = await resolveImage(formData); } catch (e) { return { error: e.message, values: data }; }
    if (!image) return { error: 'Bitte ein Bild wählen oder hochladen.', values: data };
    createGalleryItem({ ...data, image });
    revalidate();
    redirect('/dashboard/showcase/galerien');
}

export async function updateGalleryItemAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const data = parseCommon(formData);
    if (!data.title) return { error: 'Titel fehlt', values: { ...data, id } };
    let image;
    try { image = await resolveImage(formData); } catch (e) { return { error: e.message, values: { ...data, id } }; }
    // Kein neuer Upload & keine Auswahl → vorhandenes Bild behalten.
    if (!image) image = (formData.get('current_image') || '').toString();
    updateGalleryItem(id, { ...data, image });
    revalidate();
    redirect('/dashboard/showcase/galerien');
}

export async function deleteGalleryItemAction(formData) {
    deleteGalleryItem(Number(formData.get('id')));
    revalidate();
}

// Aktiv/Entwurf umschalten (Ein-Klick aus der Liste).
export async function toggleGalleryItemAction(formData) {
    setGalleryItemActive(Number(formData.get('id')), formData.get('active') === '1');
    revalidate();
}

export async function reorderGalleryItemsAction(gallery, orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderGalleryItems(gallery, orderedIds);
    revalidate();
}
