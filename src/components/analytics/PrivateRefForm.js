'use client';

import { useActionState } from 'react';
import Link from 'next/link';

// Admin-Formular für eine vertrauliche Referenz (Text). Screenshots werden auf
// der Bearbeiten-Seite separat verwaltet (erst nach dem Anlegen möglich).
export default function PrivateRefForm({ action, item }) {
    const [state, formAction, pending] = useActionState(action, { error: null, values: null });
    const v = state.values || item || {};

    return (
        <form action={formAction} className="an-form">
            {item?.id && <input type="hidden" name="id" value={item.id} />}
            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            <div className="an-field-row">
                <label className="an-field"><span>Titel *</span>
                    <input name="title" defaultValue={v.title || ''} required placeholder="Checkout-Neubau (Shopware 6)" /></label>
                <label className="an-field"><span>Kontext</span>
                    <input name="context" defaultValue={v.context || ''} placeholder="bei TC-Innovations" /></label>
            </div>

            <label className="an-field"><span>Beschreibung</span>
                <textarea name="description" rows={4} defaultValue={v.description || ''}
                          placeholder="Was war das, was hast du gebaut, welche Rolle, welches Ergebnis …" /></label>

            <label className="an-field"><span>Tech-Stack <span className="an-muted">(mit Komma trennen → Chips)</span></span>
                <input name="tech" defaultValue={v.tech || ''} placeholder="Shopware 6, Symfony, Vue.js, Twig" /></label>

            <label className="an-field"><span>Status</span>
                <select name="status" defaultValue={v.status || 'live'}>
                    <option value="live">live / im Einsatz</option>
                    <option value="in_entwicklung">in Entwicklung (noch nicht angekündigt)</option>
                </select></label>

            <label className="an-check">
                <input type="checkbox" name="is_active" defaultChecked={item ? !!v.is_active : true} />
                <span>Aktiv – kann Freigaben zugeordnet werden (ohne Haken: Entwurf, nirgends sichtbar)</span>
            </label>

            <p className="an-card-note">Vertrauliche Referenzen erscheinen <strong>ausschließlich</strong> auf den
                privaten Freigabe-Seiten, die du gezielt teilst – nie im öffentlichen Showcase oder in Suchmaschinen.</p>

            <div className="an-form-actions">
                <button type="submit" className="an-btn-primary" disabled={pending}>{pending ? 'Speichern …' : 'Speichern'}</button>
                <Link href="/dashboard/vertrauliche-referenzen" className="an-btn-secondary">Abbrechen</Link>
            </div>
        </form>
    );
}
