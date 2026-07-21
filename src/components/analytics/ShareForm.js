'use client';

import { useActionState } from 'react';
import Link from 'next/link';

// Formular zum Anlegen/Bearbeiten einer Freigabe. `documents` = alle Dokumente
// zur Auswahl (auch Entwürfe, z. B. ein nicht öffentliches Anschreiben).
export default function ShareForm({ action, share, documents = [] }) {
    const [state, formAction, pending] = useActionState(action, { error: null, values: null });
    const v = state.values || share || {};
    const selected = new Set((v.documentIds || []).map(Number));

    return (
        <form action={formAction} className="an-form an-projectform">
            {share?.id && <input type="hidden" name="id" value={share.id} />}

            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            <label className="an-field">
                <span>Titel * <span className="an-muted">(sieht der Empfänger)</span></span>
                <input name="title" defaultValue={v.title || ''} required placeholder="Bewerbungsunterlagen – Musterfirma GmbH" />
            </label>

            <label className="an-field">
                <span>Nachricht (optional)</span>
                <textarea name="message" rows={4} defaultValue={v.message || ''}
                          placeholder="Sehr geehrte Damen und Herren, anbei meine Unterlagen …" />
            </label>

            <fieldset className="an-field an-checkgroup">
                <legend>Dokumente in dieser Freigabe *</legend>
                {documents.length === 0 ? (
                    <p className="an-muted">Noch keine Dokumente vorhanden – lege zuerst welche unter „Dokumente" an.</p>
                ) : documents.map((d) => (
                    <label key={d.id} className="an-check">
                        <input type="checkbox" name="document_ids" value={d.id} defaultChecked={selected.has(d.id)} />
                        <span>{d.title}{d.is_active ? '' : ' — Entwurf (nicht öffentlich gelistet)'}</span>
                    </label>
                ))}
            </fieldset>

            <label className="an-check">
                <input type="checkbox" name="is_active" defaultChecked={share ? !!v.is_active : true} />
                <span>Aktiv – Link funktioniert (ohne Haken: gesperrt/widerrufen)</span>
            </label>

            <div className="an-form-actions">
                <button type="submit" className="an-btn-primary" disabled={pending}>
                    {pending ? 'Speichern …' : 'Speichern'}
                </button>
                <Link href="/dashboard/dokumente/freigaben" className="an-btn-secondary">Abbrechen</Link>
            </div>
        </form>
    );
}
