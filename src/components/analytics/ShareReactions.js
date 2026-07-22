import { FiCalendar, FiCheck } from 'react-icons/fi';
import { confirmSlotAction } from '@/lib/content/sharesActions';
import { RATING_FACTORS } from '@/lib/applicationStatus';

function stars(n) {
    n = Number(n) || 0;
    return '★'.repeat(n) + '☆'.repeat(5 - n);
}
function fmtSlot(s) {
    if (!s) return s;
    const [d, t] = s.split('T');
    const [y, mo, day] = (d || '').split('-');
    return day ? `${day}.${mo}.${y}${t ? ` · ${t} Uhr` : ''}` : s;
}

// Read-only Anzeige der Arbeitgeber-Reaktionen + Aktionen (Termin bestätigen).
export default function ShareReactions({ share }) {
    let slots = [];
    try { slots = JSON.parse(share.proposed_slots || '[]'); } catch { slots = []; }
    const hasFeedback = share.feedback_at > 0;
    if (slots.length === 0 && !hasFeedback) return null;

    return (
        <section className="an-card an-reactions">
            <h2 className="an-catgroup-title">Reaktionen des Arbeitgebers</h2>

            {slots.length > 0 && (
                <div className="an-reaction-block">
                    <h3><FiCalendar aria-hidden="true" /> Terminvorschläge</h3>
                    <ul className="an-slotlist">
                        {slots.map((s, i) => {
                            const confirmed = share.confirmed_slot === s;
                            return (
                                <li key={i} className="an-slot-row">
                                    <span>{fmtSlot(s)}</span>
                                    {confirmed ? (
                                        <span className="an-appstatus an-appstatus--good"><FiCheck aria-hidden="true" /> bestätigt</span>
                                    ) : (
                                        <form action={confirmSlotAction} className="an-inline-form">
                                            <input type="hidden" name="id" value={share.id} />
                                            <input type="hidden" name="slot" value={s} />
                                            <button type="submit" className="an-btn-secondary an-btn-small">Diesen Termin bestätigen</button>
                                        </form>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    {(share.proposed_contact || share.proposed_people || share.proposed_message) && (
                        <dl className="an-reaction-meta">
                            {share.proposed_contact && (<><dt>Ansprechpartner:in</dt><dd>{share.proposed_contact}</dd></>)}
                            {share.proposed_people && (<><dt>Weitere Teilnehmer</dt><dd>{share.proposed_people}</dd></>)}
                            {share.proposed_message && (<><dt>Anmerkung</dt><dd>{share.proposed_message}</dd></>)}
                        </dl>
                    )}
                    <p className="an-card-note">Bestätigen setzt den Status auf „Einladung zum Gespräch"; der Arbeitgeber sieht den Termin auf der Freigabe-Seite.</p>
                </div>
            )}

            {hasFeedback && (
                <div className="an-reaction-block">
                    <h3>Feedback zur Absage</h3>
                    {share.feedback_reason ? <p className="an-reaction-reason">{share.feedback_reason}</p> : <p className="an-muted">Kein Text angegeben.</p>}
                    <ul className="an-ratings">
                        {RATING_FACTORS.map((f) => (
                            <li key={f.key}>{f.label} <span className="an-stars">{stars(share[`rating_${f.key}`])}</span></li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
