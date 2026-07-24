'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    createPost, updatePost, deletePost, reorderPosts, reorderDocsInSpace, setPostActive, slugify,
} from '@/lib/content/postsStore';
import { saveUploadedImage } from '@/lib/content/media';

// Server Actions für redaktionelle Beiträge (Blog + Doku).

const TYPES = new Set(['blog', 'doc']);

function revalidate(type) {
    revalidatePath('/dashboard/blog');
    if (type === 'doc') {
        revalidatePath('/docs');
    } else {
        revalidatePath('/blog');
        // Die Startseite ist ISR (revalidate=600) und zeigt die 2 neuesten
        // Beiträge (KnowledgeSection). Ohne dieses gezielte Erneuern blieben dort
        // bis zu 10 Min alte Titel/Bilder stehen.
        revalidatePath('/');
    }
}

// Kategorien kommen als mehrere Checkbox-Werte oder ein CSV-Feld — beides zu
// einem bereinigten CSV-String zusammenführen.
function parseCategories(formData) {
    const many = formData.getAll('category').map((c) => c.toString().trim()).filter(Boolean);
    if (many.length) return [...new Set(many)].join(', ');
    return (formData.get('category_csv') || '').toString();
}

function parseCommon(formData) {
    const type = (formData.get('type') || 'blog').toString();
    const title = (formData.get('title') || '').toString().trim();
    const slugRaw = (formData.get('slug') || '').toString().trim();
    return {
        type: TYPES.has(type) ? type : 'blog',
        title,
        slug: slugify(slugRaw || title),
        subline: (formData.get('subline') || '').toString().trim(),
        teaser: (formData.get('teaser') || '').toString(),
        body: (formData.get('body') || '').toString(),
        category: parseCategories(formData),
        author: (formData.get('author') || '').toString().trim() || 'René van Dinter',
        doc_group: (formData.get('doc_group') || '').toString().trim(),
        parent_id: Number(formData.get('parent_id')) || 0,
        space_id: Number(formData.get('space_id')) || 0,
        published_at: (formData.get('published_at') || '').toString().trim(),
        is_active: formData.get('is_active') ? 1 : 0,
    };
}

// Doku-Seiten kehren zur Seitenliste ihres Bereichs zurück, Blog zur Blog-Liste.
function afterSaveTarget(data) {
    if (data.type === 'doc') {
        return data.space_id ? `/dashboard/blog/docs/${data.space_id}` : '/dashboard/blog/docs';
    }
    return '/dashboard/blog';
}

export async function createPostAction(prevState, formData) {
    const data = parseCommon(formData);
    if (!data.title) return { error: 'Titel fehlt', values: data };
    if (!data.slug) return { error: 'Slug konnte nicht gebildet werden', values: data };
    let image;
    try { image = await saveUploadedImage(formData.get('image')); } catch (e) { return { error: e.message, values: data }; }
    createPost({ ...data, image: image || (formData.get('image_select') || '').toString() });
    revalidate(data.type);
    redirect(afterSaveTarget(data));
}

export async function updatePostAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const data = parseCommon(formData);
    if (!data.title) return { error: 'Titel fehlt', values: { ...data, id } };
    if (!data.slug) return { error: 'Slug konnte nicht gebildet werden', values: { ...data, id } };
    let image;
    try { image = await saveUploadedImage(formData.get('image')); } catch (e) { return { error: e.message, values: { ...data, id } }; }
    // Kein neuer Upload & keine Auswahl → vorhandenes Bild behalten.
    if (!image) {
        image = (formData.get('image_select') || '').toString() || (formData.get('current_image') || '').toString();
    }
    updatePost(id, { ...data, image });
    revalidate(data.type);
    redirect(afterSaveTarget(data));
}

// Revalidiert zusätzlich die Seitenliste des Bereichs, falls es eine Doku-Seite ist.
function revalidateWithSpace(formData, type) {
    revalidate(type);
    const spaceId = (formData.get('space_id') || '').toString();
    if (type === 'doc' && spaceId) revalidatePath(`/dashboard/blog/docs/${spaceId}`);
}

export async function deletePostAction(formData) {
    const type = (formData.get('type') || 'blog').toString();
    deletePost(Number(formData.get('id')));
    revalidateWithSpace(formData, type);
}

// Aktiv/Entwurf umschalten (Ein-Klick aus der Liste).
export async function togglePostAction(formData) {
    const type = (formData.get('type') || 'blog').toString();
    setPostActive(Number(formData.get('id')), formData.get('active') === '1');
    revalidateWithSpace(formData, type);
}

export async function reorderPostsAction(type, orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderPosts(TYPES.has(type) ? type : 'blog', orderedIds);
    revalidate(type);
}

// Reihenfolge der Doku-Seiten innerhalb eines Bereichs (Drag & Drop).
export async function reorderDocsInSpaceAction(spaceId, orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderDocsInSpace(Number(spaceId), orderedIds);
    revalidatePath(`/dashboard/blog/docs/${spaceId}`);
    revalidatePath('/docs');
}
