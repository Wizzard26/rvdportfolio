'use client';

import { useActionState, useRef } from 'react';
import Link from 'next/link';
import { buildShareText, PURPOSE_LABELS } from '@/lib/shareTemplate';

// Formular zum Anlegen/Bearbeiten einer Freigabe. `documents` = alle Dokumente
// zur Auswahl (auch Entwürfe, z. B. ein nicht öffentliches Anschreiben).
export default function ShareForm({ action, share, documents = [] }) {
    const [state, formAction, pending] = useActionState(action, { error: null, values: null });
    const v = state.values || share || {};
    const selected = new Set((v.documentIds || []).map(Number));

    const formRef = useRef(null);
    const messageRef = useRef(null);

    // „Vorlage erzeugen": baut den Text aus den aktuellen Firmendaten und setzt
    // ihn ins Nachricht-Feld (danach frei editierbar).
    const fillTemplate = () => {
        const el = formRef.current?.elements;
        if (!el || !messageRef.current) return;
        messageRef.current.value = buildShareText({
            purpose: el.purpose?.value,
            company: el.company?.value,
            contact: el.contact?.value,
            position: el.position?.value,
        });
    };

    return (
        <form ref={formRef} action={formAction} className="an-form an-projectform">
            {share?.id && <input type="hidden" name="id" value={share.id} />}

            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            <div className="an-field-row">
                <label className="an-field">
                    <span>Anlass</span>
                    <select name="purpose" defaultValue={v.purpose || 'bewerbung'}>
                        {Object.entries(PURPOSE_LABELS).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                        ))}
                    </select>
                </label>
                <label className="an-field">
                    <span>Titel * <span className="an-muted">(sieht der Empfänger)</span></span>
                    <input name="title" defaultValue={v.title || ''} required placeholder="Bewerbungsunterlagen – Musterfirma GmbH" />
                </label>
            </div>

            <fieldset className="an-field an-checkgroup">
                <legend>Firmendaten (für die persönliche Ansprache)</legend>
                <div className="an-field-row">
                    <label className="an-field">
                        <span>Firmenname</span>
                        <input name="company" defaultValue={v.company || ''} placeholder="Musterfirma GmbH" />
                    </label>
                    <label className="an-field">
                        <span>Ansprechpartner:in</span>
                        <input name="contact" defaultValue={v.contact || ''} placeholder="Frau Muster" />
                    </label>
                </div>
                <label className="an-field">
                    <span>Straße &amp; Nr.</span>
                    <input name="street" defaultValue={v.street || ''} placeholder="Musterstraße 1" />
                </label>
                <div className="an-field-row">
                    <label className="an-field">
                        <span>PLZ</span>
                        <input name="zip" defaultValue={v.zip || ''} placeholder="12345" />
                    </label>
                    <label className="an-field">
                        <span>Ort</span>
                        <input name="city" defaultValue={v.city || ''} placeholder="Musterstadt" />
                    </label>
                </div>
                <label className="an-field">
                    <span>Stelle / Position</span>
                    <input name="position" defaultValue={v.position || ''} placeholder="Web-Developer (m/w/d)" />
                </label>
            </fieldset>

            <label className="an-field">
                <span>Persönlicher Text <span className="an-muted">(Teaser auf der Seite)</span></span>
                <textarea ref={messageRef} name="message" rows={8} defaultValue={v.message || ''}
                          placeholder="Sehr geehrte Damen und Herren, …" />
                <button type="button" className="an-btn-secondary an-btn-small" onClick={fillTemplate}>
                    Text aus Firmendaten erzeugen
                </button>
            </label>

            <label className="an-field">
                <span>Zugriffscode (optional) <span className="an-muted">— z. B. die PLZ der Firma</span></span>
                <input name="access_code" defaultValue={v.access_code || ''} placeholder="12345" />
                <span className="an-card-note">Ist ein Code gesetzt, muss der Empfänger ihn eingeben, bevor die Dokumente erscheinen (leichtes Gate zusätzlich zum geheimen Link).</span>
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
