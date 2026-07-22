'use client';

import { useState } from 'react';
import { FiMessageSquare, FiCalendar, FiXCircle } from 'react-icons/fi';
import { submitQuestionAction, submitAppointmentAction, submitRejectionAction } from '@/lib/content/sharesActions';
import StarRating from './StarRating';
import styles from './response.module.css';

// Reaktions-Bereich für den Arbeitgeber (unter den Downloads): Rückfrage,
// Terminvorschlag oder Absage (mit Feedback).
export default function ShareResponse({ token }) {
    const [open, setOpen] = useState(null);
    const toggle = (k) => setOpen(open === k ? null : k);

    return (
        <section className={styles.response}>
            <h2 className={styles.responseTitle}>Ihre Reaktion</h2>
            <div className={styles.responseTabs}>
                <button type="button" className={`${styles.rtab}${open === 'question' ? ` ${styles.rtabActive}` : ''}`} onClick={() => toggle('question')}>
                    <FiMessageSquare aria-hidden="true" /> Rückfrage stellen
                </button>
                <button type="button" className={`${styles.rtab}${open === 'termin' ? ` ${styles.rtabActive}` : ''}`} onClick={() => toggle('termin')}>
                    <FiCalendar aria-hidden="true" /> Termin vorschlagen
                </button>
                <button type="button" className={`${styles.rtab} ${styles.rtabReject}${open === 'absage' ? ` ${styles.rtabActive}` : ''}`} onClick={() => toggle('absage')}>
                    <FiXCircle aria-hidden="true" /> Absagen
                </button>
            </div>

            {open === 'question' && (
                <form action={submitQuestionAction} className={styles.responseForm}>
                    <input type="hidden" name="token" value={token} />
                    <label>Ihre Rückfrage oder Nachricht
                        <textarea name="message" rows={5} required placeholder="Was möchten Sie noch wissen? Oder z. B.: Wir melden uns zeitnah bei Ihnen." /></label>
                    <button type="submit" className={styles.submitBtn}>Absenden</button>
                </form>
            )}

            {open === 'termin' && (
                <form action={submitAppointmentAction} className={styles.responseForm}>
                    <input type="hidden" name="token" value={token} />
                    <p className={styles.responseHint}>Schlagen Sie bis zu 4 mögliche Termine vor – wir stimmen uns dann auf einen ab.</p>
                    <div className={styles.slots}>
                        {[1, 2, 3, 4].map((i) => (
                            <label key={i}>Vorschlag {i}
                                <input type="datetime-local" name={`slot_${i}`} /></label>
                        ))}
                    </div>
                    <label>Nachricht (optional)
                        <textarea name="message" rows={3} placeholder="Anmerkungen zu den Terminen …" /></label>
                    <button type="submit" className={styles.submitBtn}>Termine vorschlagen</button>
                </form>
            )}

            {open === 'absage' && (
                <form action={submitRejectionAction} className={styles.responseForm}>
                    <input type="hidden" name="token" value={token} />
                    <p className={styles.responseHint}>
                        Schade! Ein kurzes Feedback hilft sehr weiter. Falls Sie es sich anders überlegen,
                        können Sie stattdessen auch eine <strong>Rückfrage</strong> stellen – dann bleibt der Prozess offen.
                    </p>
                    <label>Woran lag es? (optional)
                        <textarea name="reason" rows={4} placeholder="Kurzes Feedback zur Absage …" /></label>
                    <StarRating name="rating_quality" label="Qualität der Unterlagen" />
                    <StarRating name="rating_fit" label="Fachliche Passung" />
                    <StarRating name="rating_overall" label="Gesamteindruck" />
                    <button type="submit" className={styles.rejectSubmit}>Absage absenden</button>
                    <p className={styles.responseNote}>Erst mit dem Absenden wird der Vorgang geschlossen.</p>
                </form>
            )}
        </section>
    );
}
