'use client';

import { useActionState } from 'react';
import { updateSpaceAction } from '@/lib/content/docSpacesActions';

// Kompaktes Formular zum Bearbeiten der Bereichs-Metadaten (Name, Beschreibung,
// Aktiv-Status). Der Slug wird serverseitig aus dem Namen abgeleitet.
export default function SpaceEditForm({ space }) {
    const [state, formAction, pending] = useActionState(updateSpaceAction, { error: null });

    return (
        <form action={formAction} className="an-form">
            <input type="hidden" name="id" value={space.id} />
            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}
            {state.ok && <p className="an-card-note">Gespeichert.</p>}

            <div className="an-field-row">
                <label className="an-field">
                    <span>Name *</span>
                    <input name="name" defaultValue={space.name} required />
                </label>
                <label className="an-field">
                    <span>Beschreibung</span>
                    <input name="description" defaultValue={space.description} />
                </label>
            </div>

            <label className="an-check">
                <input type="checkbox" name="is_active" defaultChecked={!!space.is_active} />
                <span>Aktiv – öffentlich sichtbar (ohne Haken: Entwurf)</span>
            </label>

            <div className="an-form-actions">
                <button type="submit" className="an-btn-primary" disabled={pending}>
                    {pending ? 'Speichern …' : 'Bereich speichern'}
                </button>
            </div>
        </form>
    );
}
