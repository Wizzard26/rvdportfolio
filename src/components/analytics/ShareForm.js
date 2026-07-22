'use client';

import { useActionState, useRef, useState } from 'react';
import Link from 'next/link';
import { buildShareText, PURPOSE_LABELS } from '@/lib/shareTemplate';
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/applicationStatus';

function todayPlus(days) {
    const d = new Date();
    d.setDate(d.getDate() + (Number(days) || 0));
    return d.toISOString().slice(0, 10);
}

export default function ShareForm({ action, share, documents = [] }) {
    const [state, formAction, pending] = useActionState(action, { error: null, values: null });
    const v = state.values || share || {};
    const selected = new Set((v.documentIds || []).map(Number));

    const formRef = useRef(null);
    const messageRef = useRef(null);
    const expiresRef = useRef(null);
    const [status, setStatus] = useState(v.status || 'offen');

    const fillTemplate = () => {
        const el = formRef.current?.elements;
        if (!el || !messageRef.current) return;
        messageRef.current.value = buildShareText({
            purpose: el.purpose?.value, company: el.company?.value,
            contact: el.contact?.value, position: el.position?.value,
        });
    };

    const setExpiryDays = () => {
        const el = formRef.current?.elements;
        const days = el?.expires_days?.value;
        if (expiresRef.current && days) expiresRef.current.value = todayPlus(days);
    };

    return (
        <form ref={formRef} action={formAction} className="an-form an-projectform">
            {share?.id && <input type="hidden" name="id" value={share.id} />}
            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            {share?.created_at ? (
                <p className="an-muted">Erstellt am {new Date(share.created_at).toLocaleDateString('de-DE')}</p>
            ) : null}

            <div className="an-field-row">
                <label className="an-field">
                    <span>Anlass</span>
                    <select name="purpose" defaultValue={v.purpose || 'bewerbung'}>
                        {Object.entries(PURPOSE_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
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
                    <label className="an-field"><span>Firmenname</span>
                        <input name="company" defaultValue={v.company || ''} placeholder="Musterfirma GmbH" /></label>
                    <label className="an-field"><span>Ansprechpartner:in</span>
                        <input name="contact" defaultValue={v.contact || ''} placeholder="Frau Muster" /></label>
                </div>
                <label className="an-field"><span>Straße &amp; Nr.</span>
                    <input name="street" defaultValue={v.street || ''} placeholder="Musterstraße 1" /></label>
                <div className="an-field-row">
                    <label className="an-field"><span>PLZ</span>
                        <input name="zip" defaultValue={v.zip || ''} placeholder="12345" /></label>
                    <label className="an-field"><span>Ort</span>
                        <input name="city" defaultValue={v.city || ''} placeholder="Musterstadt" /></label>
                </div>
                <div className="an-field-row">
                    <label className="an-field"><span>E-Mail <span className="an-muted">(Absender der Benachrichtigungen)</span></span>
                        <input type="email" name="email" defaultValue={v.email || ''} placeholder="kontakt@musterfirma.de" /></label>
                    <label className="an-field"><span>Web-Adresse</span>
                        <input name="website" defaultValue={v.website || ''} placeholder="musterfirma.de" /></label>
                </div>
                <label className="an-field"><span>Stelle / Position</span>
                    <input name="position" defaultValue={v.position || ''} placeholder="Web-Developer (m/w/d)" /></label>
            </fieldset>

            <fieldset className="an-field an-checkgroup">
                <legend>Zeitlicher Ablauf</legend>
                <div className="an-field-row">
                    <label className="an-field"><span>Zugestellt am</span>
                        <input type="date" name="sent_at" defaultValue={v.sent_at || ''} /></label>
                    <label className="an-field"><span>Wiedervorlage / nachfassen am</span>
                        <input type="date" name="followup_at" defaultValue={v.followup_at || ''} /></label>
                </div>
                <label className="an-field"><span>Ablaufdatum (optional) – danach schließt der Link automatisch</span>
                    <input type="date" name="expires_at" defaultValue={v.expires_at || ''} ref={expiresRef} /></label>
                <div className="an-inline-days">
                    <input type="number" name="expires_days" min="1" placeholder="Tage" className="an-days-input" />
                    <button type="button" className="an-btn-secondary an-btn-small" onClick={setExpiryDays}>+ Tage ab heute</button>
                </div>
            </fieldset>

            <fieldset className="an-field an-checkgroup">
                <legend>Antwort / Status</legend>
                <label className="an-field"><span>Status im Bewerbungsprozess</span>
                    <select name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        {STATUS_ORDER.map((k) => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
                    </select>
                </label>

                {status === 'gespraech' && (
                    <>
                        <div className="an-field-row">
                            <label className="an-field"><span>Gesprächstermin (Datum &amp; Uhrzeit)</span>
                                <input type="datetime-local" name="interview_at" defaultValue={v.interview_at || ''} /></label>
                            <label className="an-field"><span>Ansprechpartner:in im Gespräch</span>
                                <input name="interview_contact" defaultValue={v.interview_contact || ''} placeholder="Herr Schmidt" /></label>
                        </div>
                        <label className="an-field"><span>Weitere beteiligte Personen</span>
                            <input name="interview_people" defaultValue={v.interview_people || ''} placeholder="Teamleitung, HR" /></label>
                    </>
                )}
                {(status === 'zusage' || status === 'absage') && (
                    <label className="an-field"><span>{status === 'zusage' ? 'Zusage am' : 'Absage am'}</span>
                        <input type="date" name="decision_date" defaultValue={v.decision_date || ''} /></label>
                )}
                {status === 'absage' && (
                    <label className="an-field"><span>Grund der Absage</span>
                        <textarea name="rejection_reason" rows={3} defaultValue={v.rejection_reason || ''} /></label>
                )}
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
                <span className="an-card-note">Ist ein Code gesetzt, muss der Empfänger ihn eingeben, bevor die Dokumente erscheinen.</span>
            </label>

            <label className="an-field"><span>Interne Notizen (nur im Admin)</span>
                <textarea name="notes" rows={3} defaultValue={v.notes || ''} placeholder="z. B. Recruiter angerufen, …" /></label>

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
                <button type="submit" className="an-btn-primary" disabled={pending}>{pending ? 'Speichern …' : 'Speichern'}</button>
                <Link href="/dashboard/dokumente/freigaben" className="an-btn-secondary">Abbrechen</Link>
            </div>
        </form>
    );
}
