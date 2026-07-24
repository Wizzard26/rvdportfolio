'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    createSpace, updateSpace, deleteSpace, reorderSpaces, setSpaceActive,
} from '@/lib/content/docSpacesStore';

// Server Actions für die Doku-Bereiche (GitBook-artige Spaces).

function revalidate() {
    revalidatePath('/dashboard/blog/docs');
    revalidatePath('/docs');
}

export async function createSpaceAction(prevState, formData) {
    const name = (formData.get('name') || '').toString().trim();
    if (!name) return { error: 'Name fehlt' };
    createSpace({ name, description: (formData.get('description') || '').toString() });
    revalidate();
    return { error: null, ok: true };
}

export async function updateSpaceAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const name = (formData.get('name') || '').toString().trim();
    if (!name) return { error: 'Name fehlt', ok: false };
    updateSpace(id, {
        name,
        description: (formData.get('description') || '').toString(),
        is_active: formData.get('is_active') ? 1 : 0,
    });
    revalidate();
    return { error: null, ok: true };
}

export async function deleteSpaceAction(formData) {
    deleteSpace(Number(formData.get('id')));
    revalidate();
    redirect('/dashboard/blog/docs');
}

export async function toggleSpaceAction(formData) {
    setSpaceActive(Number(formData.get('id')), formData.get('active') === '1');
    revalidate();
}

export async function reorderSpacesAction(orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderSpaces(orderedIds);
    revalidate();
}
