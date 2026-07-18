'use client';

import { useActionState } from 'react';
import Link from 'next/link';

// Formular zum Anlegen/Bearbeiten einer Vita-Station. Wird für „Neu" und
// „Bearbeiten" wiederverwendet — die passende Server Action wird via `action`
// hereingereicht, vorhandene Werte via `station`.
export default function StationForm({ action, station }) {
    const [state, formAction, pending] = useActionState(action, { error: null, values: null });
    const v = state.values || station || {};

    return (
        <form action={formAction} className="an-form">
            {station?.id && <input type="hidden" name="id" value={station.id} />}

            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            <label className="an-field">
                <span>Titel *</span>
                <input name="title" defaultValue={v.title || ''} required />
            </label>

            <label className="an-field">
                <span>Firma / Institution *</span>
                <input name="company" defaultValue={v.company || ''} required />
            </label>

            <div className="an-field-row">
                <label className="an-field">
                    <span>Beginn * (MM/JJJJ)</span>
                    <input name="start" defaultValue={v.start || ''} placeholder="07/2025" required />
                </label>
                <label className="an-field">
                    <span>Ende (MM/JJJJ)</span>
                    <input name="end" defaultValue={v.end || ''} placeholder="07/2026" />
                </label>
            </div>

            <label className="an-check">
                <input type="checkbox" name="is_current" defaultChecked={!!v.is_current} />
                <span>Station läuft noch (Ende wird als aktueller Monat angezeigt)</span>
            </label>

            <label className="an-field">
                <span>Beschreibung</span>
                <textarea name="description" rows={6} defaultValue={v.description || ''} />
            </label>

            <label className="an-check">
                <input type="checkbox" name="is_active" defaultChecked={!!v.is_active} />
                <span>Aktiv – öffentlich sichtbar (ohne Haken: Entwurf)</span>
            </label>

            <div className="an-form-actions">
                <button type="submit" className="an-btn-primary" disabled={pending}>
                    {pending ? 'Speichern …' : 'Speichern'}
                </button>
                <Link href="/dashboard/vita" className="an-btn-secondary">Abbrechen</Link>
            </div>
        </form>
    );
}
