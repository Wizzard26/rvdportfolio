'use client';

import { useActionState } from 'react';
import Link from 'next/link';

// Formular zum Anlegen/Bearbeiten eines Dokuments. `pdfs` = Auswahlliste
// vorhandener/hochgeladener PDFs (Repo + Volume).
export default function DocumentForm({ action, document, pdfs = [] }) {
    const [state, formAction, pending] = useActionState(action, { error: null, values: null });
    const v = state.values || document || {};

    return (
        <form action={formAction} className="an-form an-projectform">
            {document?.id && <input type="hidden" name="id" value={document.id} />}
            <input type="hidden" name="current_file" value={document?.file || ''} />

            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            <label className="an-field">
                <span>Titel *</span>
                <input name="title" defaultValue={v.title || ''} required placeholder="Vita / Lebenslauf" />
            </label>

            <label className="an-field">
                <span>Kennung (optional)</span>
                <input name="slug" defaultValue={v.slug || ''} placeholder="vita" />
                <span className="an-card-note">Ergibt eine feste Verlinkung <code>/download/&lt;kennung&gt;</code> (bleibt gültig, auch wenn du die Datei austauschst). Welches Dokument der „Vita als Download"-Button nutzt, wählst du in der Übersicht.</span>
            </label>

            <div className="an-pdf-field">
                <label className="an-field">
                    <span>Vorhandene PDF wählen</span>
                    <select name="file_select" defaultValue={document?.file || ''}>
                        <option value="">— keine / behalten —</option>
                        {pdfs.map((p) => (
                            <option key={p.link} value={p.link}>{p.label}{p.source === 'upload' ? ' (hochgeladen)' : ''}</option>
                        ))}
                    </select>
                </label>
                <label className="an-field">
                    <span>oder neue PDF hochladen (überschreibt die Auswahl)</span>
                    <input type="file" name="file" accept="application/pdf,.pdf" />
                </label>
            </div>

            <label className="an-check">
                <input type="checkbox" name="is_active" defaultChecked={!!v.is_active} />
                <span>Aktiv – öffentlich als Download verfügbar (ohne Haken: Entwurf)</span>
            </label>

            <div className="an-form-actions">
                <button type="submit" className="an-btn-primary" disabled={pending}>
                    {pending ? 'Speichern …' : 'Speichern'}
                </button>
                <Link href="/dashboard/dokumente" className="an-btn-secondary">Abbrechen</Link>
            </div>
        </form>
    );
}
