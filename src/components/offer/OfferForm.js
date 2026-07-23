'use client';

import { useActionState, useEffect, useRef } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { roboto_condensed } from '@/app/fonts';
import { submitOfferAction } from '@/lib/content/offersActions';
import {
    offerQuestionsByGroup, OFFER_WORK_MODELS, OFFER_CONTRACT_TYPES,
    OFFER_SALARY, OFFER_HOURS, OFFER_VACATION, OFFER_HOMEOFFICE, OFFER_LEARNING,
} from '@/lib/offerContent';
import { track } from '@/lib/analytics/track';
import { DualRange, SingleRange } from './RangeInputs';
import styles from './offer.module.css';

const eur = (v) => `${Number(v).toLocaleString('de-DE')} €`;

function TextQuestions({ group, values, rows = 2 }) {
    return offerQuestionsByGroup(group).map((q) => (
        <label key={q.key} className={styles.field}><span>{q.label}</span>
            <textarea name={q.key} rows={rows} defaultValue={values[q.key] || ''} placeholder={q.placeholder} />
        </label>
    ));
}

function Pills({ name, options }) {
    return (
        <div className={styles.checks}>
            {options.map((o) => (
                <label key={o} className={styles.check}>
                    <input type="checkbox" name={name} value={o} /> {o}
                </label>
            ))}
        </div>
    );
}

export default function OfferForm() {
    const [state, formAction, pending] = useActionState(submitOfferAction, { ok: false });
    const v = state.values || {};

    const started = useRef(false);
    const onFocus = () => {
        if (!started.current) { started.current = true; track('form_start', { name: 'Umgekehrte Bewerbung' }); }
    };
    useEffect(() => { if (state.ok) track('conversion', { name: 'Umgekehrte Bewerbung' }); }, [state.ok]);

    if (state.ok) {
        return (
            <div className={styles.success}>
                <FiCheckCircle aria-hidden="true" className={styles.successIcon} />
                <h2 className={roboto_condensed.className}>Angebot erhalten – Respekt!</h2>
                <p>Vielen Dank, dass Sie den ersten Schritt gemacht haben. Ich sehe mir Ihr Angebot in Ruhe an
                    und melde mich zeitnah bei Ihnen zurück.</p>
            </div>
        );
    }

    return (
        <form action={formAction} onFocus={onFocus} className={styles.form}>
            {state.error && <p className={styles.formError} role="alert">{state.error}</p>}

            <fieldset className={styles.block}>
                <legend>Wer bewirbt sich?</legend>
                <div className={styles.grid}>
                    <label className={styles.field}><span>Firma *</span>
                        <input name="company" required defaultValue={v.company || ''} placeholder="Musterfirma GmbH" /></label>
                    <label className={styles.field}><span>Ansprechpartner:in</span>
                        <input name="contact" defaultValue={v.contact || ''} placeholder="Ihr Name" /></label>
                    <label className={styles.field}><span>E-Mail *</span>
                        <input type="email" name="email" required defaultValue={v.email || ''} placeholder="sie@musterfirma.de" /></label>
                    <label className={styles.field}><span>Web-Adresse</span>
                        <input name="website" defaultValue={v.website || ''} placeholder="musterfirma.de" /></label>
                    <label className={`${styles.field} ${styles.full}`}><span>Für welche Position möchten Sie mir ein Angebot machen?</span>
                        <input name="position" defaultValue={v.position || ''} placeholder="z. B. Frontend-Developer (m/w/d)" /></label>
                </div>
            </fieldset>

            <fieldset className={styles.block}>
                <legend>Erster Eindruck</legend>
                <div className={styles.grid}>
                    <p className={`${styles.hint} ${styles.full}`}>Alles optional – aber je mehr Sie verraten, desto ernster kann ich Ihr Angebot nehmen.</p>
                    <TextQuestions group="eindruck" values={v} />
                </div>
            </fieldset>

            <fieldset className={styles.block}>
                <legend>Die Position &amp; das Umfeld</legend>
                <div className={styles.grid}>
                    <TextQuestions group="umfeld" values={v} />
                </div>
            </fieldset>

            <fieldset className={styles.block}>
                <legend>Die Rahmenbedingungen</legend>
                <div className={styles.grid}>
                    <div className={`${styles.field} ${styles.full}`}>
                        <span>Welches Arbeitsmodell bieten Sie? <em className={styles.muted}>(Mehrfachauswahl)</em></span>
                        <Pills name="model" options={OFFER_WORK_MODELS} />
                    </div>

                    <label className={styles.field}><span>Standort – wo sitzt das Team?</span>
                        <input name="location" defaultValue={v.location || ''} placeholder="z. B. Hamburg (oder vollständig remote)" /></label>
                    <div className={styles.field}><span>Homeoffice-Anteil</span>
                        <SingleRange name="homeoffice_pct" {...OFFER_HOMEOFFICE} format={(x) => `${x} %`} /></div>

                    <div className={styles.field}><span>Wie viele Stunden pro Woche?</span>
                        <SingleRange name="hours_per_week" {...OFFER_HOURS} format={(x) => `${x} h / Woche`} /></div>
                    <div className={styles.field}><span>Wie viele Urlaubstage?</span>
                        <SingleRange name="vacation_days" {...OFFER_VACATION} format={(x) => `${x} Tage`} /></div>

                    <label className={styles.field}><span>Frühester Startzeitpunkt</span>
                        <input name="start_date" defaultValue={v.start_date || ''} placeholder="z. B. ab sofort, in 3 Monaten, flexibel" /></label>
                    <label className={styles.field}><span>Probezeit</span>
                        <input name="probation" defaultValue={v.probation || ''} placeholder="z. B. 6 Monate, keine" /></label>

                    <div className={`${styles.field} ${styles.full}`}>
                        <span>Vertragsart <em className={styles.muted}>(Mehrfachauswahl)</em></span>
                        <Pills name="contract" options={OFFER_CONTRACT_TYPES} />
                    </div>

                    <div className={`${styles.field} ${styles.full}`}><span>Weiterbildungsbudget pro Jahr</span>
                        <SingleRange name="learning_budget" {...OFFER_LEARNING} format={(x) => `${eur(x)} / Jahr`} /></div>

                    <div className={`${styles.field} ${styles.full}`}><span>Welche Gehaltsrange bieten Sie mir? <em className={styles.muted}>(brutto p. a.)</em></span>
                        <DualRange nameMin="salary_min" nameMax="salary_max" {...OFFER_SALARY} format={eur} /></div>
                </div>
            </fieldset>

            <fieldset className={styles.block}>
                <legend>Zum Schluss</legend>
                <div className={styles.grid}>
                    <TextQuestions group="schluss" values={v} rows={3} />
                    <label className={styles.field}><span>Noch etwas, das ich wissen sollte?</span>
                        <textarea name="message" rows={3} defaultValue={v.message || ''} placeholder="Ihre Nachricht (optional) …" /></label>
                </div>
            </fieldset>

            {/* Honeypot gegen Bots – für Menschen unsichtbar. */}
            <input type="text" name="confirm_email" tabIndex={-1} autoComplete="off" className={styles.honeypot} aria-hidden="true" />

            <div className={styles.actions}>
                <span className={styles.required}>* Pflichtfelder</span>
                <button type="submit" className={styles.submit} disabled={pending}>
                    {pending ? 'Wird gesendet …' : 'Angebot absenden'}
                </button>
            </div>
        </form>
    );
}
