'use client';

import { useActionState } from 'react';
import Link from 'next/link';

export default function TestimonialForm({ action, testimonial }) {
    const [state, formAction, pending] = useActionState(action, { error: null, values: null });
    const v = state.values || testimonial || {};

    return (
        <form action={formAction} className="an-form">
            {testimonial?.id && <input type="hidden" name="id" value={testimonial.id} />}
            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            <label className="an-field">
                <span>Zitat *</span>
                <textarea name="quote" rows={4} defaultValue={v.quote || ''} required
                          placeholder="René hat unser Shopware-Projekt sauber und termintreu umgesetzt …" />
            </label>

            <div className="an-field-row">
                <label className="an-field"><span>Autor *</span>
                    <input name="author" defaultValue={v.author || ''} required placeholder="Sabine Muster" /></label>
                <label className="an-field"><span>Rolle</span>
                    <input name="role" defaultValue={v.role || ''} placeholder="Teamleitung Entwicklung" /></label>
            </div>

            <label className="an-field"><span>Firma</span>
                <input name="company" defaultValue={v.company || ''} placeholder="Musterfirma GmbH" /></label>

            <label className="an-check">
                <input type="checkbox" name="is_active" defaultChecked={testimonial ? !!v.is_active : true} />
                <span>Aktiv – wird öffentlich angezeigt (ohne Haken: Entwurf)</span>
            </label>

            <div className="an-form-actions">
                <button type="submit" className="an-btn-primary" disabled={pending}>{pending ? 'Speichern …' : 'Speichern'}</button>
                <Link href="/dashboard/referenzen" className="an-btn-secondary">Abbrechen</Link>
            </div>
        </form>
    );
}
