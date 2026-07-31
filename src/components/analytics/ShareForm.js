'use client';

import { useActionState, useRef, useState } from 'react';
import Link from 'next/link';
import {
    buildShareText, PURPOSE_LABELS, CONTACT_GENDER_LABELS,
    EMPLOYMENT_LABELS, WORK_MODEL_LABELS, SALARY_PERIOD_LABELS,
} from '@/lib/shareTemplate';
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/applicationStatus';
import ShareDocumentPicker from '@/components/analytics/ShareDocumentPicker';
import ShareTestimonialPicker from '@/components/analytics/ShareTestimonialPicker';
import SharePrivateRefPicker from '@/components/analytics/SharePrivateRefPicker';

function todayPlus(days) {
    const d = new Date();
    d.setDate(d.getDate() + (Number(days) || 0));
    return d.toISOString().slice(0, 10);
}

export default function ShareForm({ action, share, documents = [], testimonials = [], privateRefs = [] }) {
    const [state, formAction, pending] = useActionState(action, { error: null, values: null });
    const v = state.values || share || {};

    const formRef = useRef(null);
    const messageRef = useRef(null);
    const availabilityRef = useRef(null);
    const expiresRef = useRef(null);
    const [status, setStatus] = useState(v.status || 'offen');
    const [empType, setEmpType] = useState(v.employment_type || '');

    const fillTemplate = () => {
        const el = formRef.current?.elements;
        if (!el || !messageRef.current) return;
        messageRef.current.value = buildShareText({
            purpose: el.purpose?.value, company: el.company?.value,
            contact: el.contact?.value, contact_gender: el.contact_gender?.value,
            position: el.position?.value, motivation: el.motivation?.value,
            job_ref: el.job_ref?.value,
        });
    };

    const setAvailability = (text) => { if (availabilityRef.current) availabilityRef.current.value = text; };

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
                <p className="an-muted">Erstellt am {new Date(share.created_at).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' })}</p>
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
                    <label className="an-field"><span>Anrede <span className="an-muted">(steuert „Sehr geehrte…“)</span></span>
                        <select name="contact_gender" defaultValue={v.contact_gender || ''}>
                            {Object.entries(CONTACT_GENDER_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                        </select></label>
                </div>
                <label className="an-field"><span>Name des Ansprechpartners <span className="an-muted">(Nachname genügt, z. B. Muster)</span></span>
                    <input name="contact" defaultValue={v.contact || ''} placeholder="Muster" /></label>
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
                <legend>Keyfacts <span className="an-muted">(scannbare Übersichts-Karte auf der Seite)</span></legend>
                <div className="an-field-row">
                    <label className="an-field"><span>Arbeitsmodell</span>
                        <select name="work_model" defaultValue={v.work_model || ''}>
                            <option value="">— keine Angabe —</option>
                            {Object.entries(WORK_MODEL_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                        </select></label>
                    <label className="an-field"><span>Umfang</span>
                        <select name="employment_type" value={empType} onChange={(e) => setEmpType(e.target.value)}>
                            <option value="">— keine Angabe —</option>
                            {Object.entries(EMPLOYMENT_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                        </select></label>
                </div>
                {(empType === 'teilzeit' || empType === 'beides') && (
                    <div className="an-field-row">
                        <label className="an-field"><span>Stunden/Woche von</span>
                            <input type="number" name="hours_from" min="0" max="60" defaultValue={v.hours_from || ''} placeholder="20" /></label>
                        <label className="an-field"><span>Stunden/Woche bis</span>
                            <input type="number" name="hours_to" min="0" max="60" defaultValue={v.hours_to || ''} placeholder="30" /></label>
                    </div>
                )}

                <label className="an-field"><span>Verfügbar ab</span>
                    <input name="availability" ref={availabilityRef} defaultValue={v.availability || ''}
                           placeholder="sofort / ab 01.09.2026 / nach Absprache" /></label>
                <div className="an-inline-days">
                    <button type="button" className="an-btn-secondary an-btn-small" onClick={() => setAvailability('sofort')}>sofort</button>
                    <button type="button" className="an-btn-secondary an-btn-small" onClick={() => setAvailability('zum nächstmöglichen Zeitpunkt')}>nächstmöglich</button>
                    <button type="button" className="an-btn-secondary an-btn-small" onClick={() => setAvailability('nach Absprache')}>nach Absprache</button>
                </div>

                <div className="an-field-row">
                    <label className="an-field"><span>Gehaltswunsch <span className="an-muted">(Betrag)</span></span>
                        <input name="salary_amount" defaultValue={v.salary_amount || ''} placeholder="55.000–60.000" /></label>
                    <label className="an-field"><span>Zeitraum</span>
                        <select name="salary_period" defaultValue={v.salary_period || ''}>
                            <option value="">— keine Angabe —</option>
                            {Object.entries(SALARY_PERIOD_LABELS).map(([k, label]) => <option key={k} value={k}>{label.replace('/ ', 'pro ')}</option>)}
                        </select></label>
                </div>
                <label className="an-field"><span>Gehalt bezogen auf <span className="an-muted">(Std./Woche – optional, v. a. bei Teilzeit → „… bei 24 Std./Woche“)</span></span>
                    <input type="number" name="salary_hours" min="0" max="60" defaultValue={v.salary_hours || ''} placeholder="24" className="an-days-input" /></label>
                <label className="an-check">
                    <input type="checkbox" name="salary_public" defaultChecked={!!v.salary_public} />
                    <span>Gehaltswunsch auf der Seite anzeigen <span className="an-muted">— sonst nur intern sichtbar</span></span>
                </label>

                <label className="an-field"><span>Kern-Skills <span className="an-muted">(eine pro Zeile oder komma­getrennt → Chips)</span></span>
                    <textarea name="skills" rows={3} defaultValue={v.skills || ''} placeholder={"Shopware 6\nNext.js / React\nPHP, JavaScript, SQL"} /></label>
                <label className="an-field"><span>Besonderheiten <span className="an-muted">(eine pro Zeile → Stichpunkte)</span></span>
                    <textarea name="highlights" rows={3} defaultValue={v.highlights || ''} placeholder={"8 Jahre E-Commerce-Erfahrung\nEigene Plugins im Shopware Store"} /></label>

                <div className="an-field-row">
                    <label className="an-field"><span>Standort &amp; Mobilität <span className="an-muted">(optional)</span></span>
                        <input name="mobility" defaultValue={v.mobility || ''} placeholder="Raum Musterstadt · pendel-/umzugsbereit" /></label>
                    <label className="an-field"><span>Fundort der Stelle <span className="an-muted">(bei Stellen-Bewerbung)</span></span>
                        <input name="job_ref" defaultValue={v.job_ref || ''} placeholder="Ihre Anzeige auf LinkedIn vom 20.07." /></label>
                </div>
            </fieldset>

            <label className="an-field">
                <span>„Warum ihr“ – Passung in 1–2 Sätzen <span className="an-muted">(macht das Anschreiben individuell)</span></span>
                <textarea name="motivation" rows={3} defaultValue={v.motivation || ''}
                          placeholder="Ihr Fokus auf saubere Shopware-Architektur passt genau zu dem, wofür ich brenne …" />
            </label>

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

            <ShareTestimonialPicker testimonials={testimonials} initialIds={v.testimonialIds || []} />

            <SharePrivateRefPicker refs={privateRefs} initialIds={v.privateRefIds || []} />

            <fieldset className="an-field an-checkgroup">
                <legend>Zusätzliche Elemente auf der Seite <span className="an-muted">(optional)</span></legend>
                <label className="an-check">
                    <input type="checkbox" name="show_showcase_cta" defaultChecked={!!v.show_showcase_cta} />
                    <span>Button „Meine Referenzprojekte ansehen" (zur Showcase, öffnet neuen Tab)</span>
                </label>
            </fieldset>

            <ShareDocumentPicker documents={documents} initialIds={v.documentIds || []} />

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
