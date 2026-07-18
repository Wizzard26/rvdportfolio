'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
    createStation, updateStation, deleteStation, reorderStations, setStationActive,
} from '@/lib/content/vitaStore';

// Server Actions für die Vita-Verwaltung im Admin. Nach jeder Änderung wird die
// öffentliche /vita-Seite und die Admin-Liste revalidiert, damit der neue Stand
// sofort sichtbar ist.

// Liest die Formularfelder aus und validiert das Nötigste.
function parseStation(formData) {
    const title = (formData.get('title') || '').toString().trim();
    const company = (formData.get('company') || '').toString().trim();
    const description = (formData.get('description') || '').toString().trim();
    const start = (formData.get('start') || '').toString().trim();
    const end = (formData.get('end') || '').toString().trim();
    const is_current = formData.get('is_current') ? 1 : 0;
    const is_active = formData.get('is_active') ? 1 : 0;

    const errors = [];
    if (!title) errors.push('Titel fehlt');
    if (!company) errors.push('Firma fehlt');
    if (!start) errors.push('Beginn fehlt');
    if (!is_current && !end) errors.push('Ende fehlt (oder „läuft noch" ankreuzen)');

    return { data: { title, company, description, start, end, is_current, is_active }, errors };
}

function revalidateVita() {
    revalidatePath('/vita');
    revalidatePath('/dashboard/vita');
}

export async function createStationAction(prevState, formData) {
    const { data, errors } = parseStation(formData);
    if (errors.length) return { error: errors.join(' · '), values: data };
    createStation(data);
    revalidateVita();
    redirect('/dashboard/vita');
}

export async function updateStationAction(prevState, formData) {
    const id = Number(formData.get('id'));
    const { data, errors } = parseStation(formData);
    if (errors.length) return { error: errors.join(' · '), values: { ...data, id } };
    updateStation(id, data);
    revalidateVita();
    redirect('/dashboard/vita');
}

// Löschen wird per <form action> aus der Liste aufgerufen; die ID steckt als
// hidden field im Formular.
export async function deleteStationAction(formData) {
    deleteStation(Number(formData.get('id')));
    revalidateVita();
}

// Aktiv/Entwurf umschalten (Ein-Klick aus der Liste).
export async function toggleStationAction(formData) {
    setStationActive(Number(formData.get('id')), formData.get('active') === '1');
    revalidateVita();
}

// Neue Reihenfolge nach Drag & Drop. `orderedIds` = Anzeige-Reihenfolge (oben
// zuerst). Wird direkt aus der Client-Liste aufgerufen (kein Formular).
export async function reorderStationsAction(orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    reorderStations(orderedIds);
    revalidateVita();
}
