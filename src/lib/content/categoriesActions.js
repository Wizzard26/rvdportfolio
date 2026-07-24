'use server';

import { revalidatePath } from 'next/cache';
import {
    createCategory, deleteCategory, reorderCategories, setCategoryActive,
} from '@/lib/content/categoriesStore';

// Server Actions für die Blog-Kategorien-Verwaltung.

function revalidate() {
    revalidatePath('/dashboard/blog/kategorien');
    revalidatePath('/dashboard/blog/new');
    revalidatePath('/blog');
}

export async function createCategoryAction(prevState, formData) {
    const name = (formData.get('name') || '').toString().trim();
    if (!name) return { error: 'Name fehlt' };
    createCategory(name);
    revalidate();
    return { error: null, ok: true };
}

export async function deleteCategoryAction(formData) {
    deleteCategory(Number(formData.get('id')));
    revalidate();
}

export async function toggleCategoryAction(formData) {
    setCategoryActive(Number(formData.get('id')), formData.get('active') === '1');
    revalidate();
}

export async function reorderCategoriesAction(orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderCategories(orderedIds);
    revalidate();
}
