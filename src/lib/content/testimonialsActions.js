'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    createTestimonial, updateTestimonial, deleteTestimonial, reorderTestimonials, setTestimonialActive,
    SHOWCASE_KEY, ABOUT_KEY, SHOPWARE_KEY,
} from '@/lib/content/testimonialsStore';
import { setSetting } from '@/lib/content/settingsStore';

function revalidate() {
    revalidatePath('/dashboard/referenzen');
    revalidatePath('/showcase');
    revalidatePath('/about-me');
    revalidatePath('/shopware-entwickler');
    // Freigabe-Seiten sind force-dynamic → keine Revalidierung nötig.
}

function parse(formData) {
    return {
        author: (formData.get('author') || '').toString().trim(),
        role: (formData.get('role') || '').toString().trim(),
        company: (formData.get('company') || '').toString().trim(),
        quote: (formData.get('quote') || '').toString().trim(),
        is_active: formData.get('is_active') ? 1 : 0,
    };
}

export async function createTestimonialAction(prevState, formData) {
    const data = parse(formData);
    if (!data.quote) return { error: 'Zitat fehlt', values: data };
    if (!data.author) return { error: 'Autor fehlt', values: data };
    createTestimonial(data);
    revalidate();
    redirect('/dashboard/referenzen');
}

export async function updateTestimonialAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const data = parse(formData);
    if (!data.quote) return { error: 'Zitat fehlt', values: { ...data, id } };
    if (!data.author) return { error: 'Autor fehlt', values: { ...data, id } };
    updateTestimonial(id, data);
    revalidate();
    redirect('/dashboard/referenzen');
}

export async function deleteTestimonialAction(formData) {
    deleteTestimonial(Number(formData.get('id')));
    revalidate();
}

export async function toggleTestimonialAction(formData) {
    setTestimonialActive(Number(formData.get('id')), formData.get('active') === '1');
    revalidate();
}

export async function reorderTestimonialsAction(orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderTestimonials(orderedIds);
    revalidate();
}

// Globale Anzeige-Schalter (Showcase / About).
export async function setTestimonialPlacementAction(formData) {
    setSetting(SHOWCASE_KEY, formData.get('show_showcase') ? '1' : '0');
    setSetting(ABOUT_KEY, formData.get('show_about') ? '1' : '0');
    setSetting(SHOPWARE_KEY, formData.get('show_shopware') ? '1' : '0');
    revalidate();
}
