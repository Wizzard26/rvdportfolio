'use client';

import { useState } from 'react';
import { FiCalendar, FiXCircle, FiCheckCircle } from 'react-icons/fi';
import { submitQuestionAction, submitAppointmentAction, submitRejectionAction } from '@/lib/content/sharesActions';
import { RATING_FACTORS } from '@/lib/applicationStatus';
import ShareConversation from './ShareConversation';
import StarRating from './StarRating';
import styles from './response.module.css';

function fmtSlot(s) {
    if (!s) return s;
    const [d, t] = s.split('T');
    const [y, mo, day] = (d || '').split('-');
    return day ? `${day}.${mo}.${y}${t ? ` · ${t} Uhr` : ''}` : s;
}

// Rechte Spalte der Freigabe-Seite: Gespräch (Chat), Termine, Absage.
export default function ShareResponse({ token, conversation = [], confirmedSlot }) {
    const [open, setOpen] = useState(null);
    const toggle = (k) => setOpen(open === k ? null : k);

    return (
        <div className={styles.aside}>
            <section className={styles.panel}>
                <h2 className={styles.panelTitle}>Gespräch</h2>
                <ShareConversation
                    messages={conversation}
                    perspective="employer"
                    sendAction={submitQuestionAction}
                    hiddenName="token"
                    hiddenValue={token}
                    placeholder="Ihre Rückfrage oder Nachricht …"
                />
            </section>

            <section className={styles.panel}>
                <h2 className={styles.panelTitle}><FiCalendar aria-hidden="true" /> Termin</h2>
                {confirmedSlot && (
                    <p className={styles.confirmed}><FiCheckCircle aria-hidden="true" /> Bestätigt: {fmtSlot(confirmedSlot)}</p>
                )}
                {open === 'termin' ? (
                    <form action={submitAppointmentAction} className={styles.miniForm}>
                        <input type="hidden" name="token" value={token} />
                        <p className={styles.hint}>Bis zu 4 mögliche Termine – ich melde mich zur Abstimmung.</p>
                        {[1, 2, 3, 4].map((i) => (
                            <input key={i} type="datetime-local" name={`slot_${i}`} aria-label={`Terminvorschlag ${i}`} />
                        ))}
                        <textarea name="message" rows={2} placeholder="Anmerkung (optional) …" />
                        <div className={styles.miniActions}>
                            <button type="submit" className={styles.primary}>Vorschlagen</button>
                            <button type="button" className={styles.ghost} onClick={() => setOpen(null)}>Abbrechen</button>
                        </div>
                    </form>
                ) : (
                    <button type="button" className={styles.blockBtn} onClick={() => toggle('termin')}>
                        {confirmedSlot ? 'Anderen Termin vorschlagen' : 'Termin vorschlagen'}
                    </button>
                )}
            </section>

            <section className={styles.panel}>
                {open === 'absage' ? (
                    <form action={submitRejectionAction} className={styles.miniForm}>
                        <input type="hidden" name="token" value={token} />
                        <h2 className={styles.panelTitle}><FiXCircle aria-hidden="true" /> Absage</h2>
                        <p className={styles.hint}>Falls Sie es sich anders überlegen, schreiben Sie stattdessen im Gespräch – dann bleibt der Prozess offen.</p>
                        <textarea name="reason" rows={3} placeholder="Woran lag es? (optional)" />
                        <p className={styles.hint}>Bewertung (optional) – hilft mir sehr weiter:</p>
                        {RATING_FACTORS.map((f) => <StarRating key={f.key} name={`rating_${f.key}`} label={f.label} />)}
                        <div className={styles.miniActions}>
                            <button type="submit" className={styles.reject}>Absage absenden</button>
                            <button type="button" className={styles.ghost} onClick={() => setOpen(null)}>Abbrechen</button>
                        </div>
                        <p className={styles.note}>Erst mit dem Absenden wird der Vorgang geschlossen.</p>
                    </form>
                ) : (
                    <button type="button" className={`${styles.blockBtn} ${styles.rejectBtn}`} onClick={() => toggle('absage')}>
                        <FiXCircle aria-hidden="true" /> Absagen
                    </button>
                )}
            </section>
        </div>
    );
}
