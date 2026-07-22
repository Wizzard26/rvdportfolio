import { FiCalendar } from 'react-icons/fi';

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

// Read-only Anzeige der Arbeitgeber-Reaktionen (Terminvorschläge, Absage-Feedback).
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
                    <h3><FiCalendar aria-hidden="true" /> Terminvorschläge des Arbeitgebers</h3>
                    <ul className="an-slotlist">{slots.map((s, i) => <li key={i}>{fmtSlot(s)}</li>)}</ul>
                    <p className="an-card-note">Zum Übernehmen: oben Status auf „Einladung zum Gespräch" setzen und den gewählten Termin eintragen.</p>
                </div>
            )}
            {hasFeedback && (
                <div className="an-reaction-block">
                    <h3>Feedback zur Absage</h3>
                    {share.feedback_reason ? <p className="an-reaction-reason">{share.feedback_reason}</p> : <p className="an-muted">Kein Text angegeben.</p>}
                    <ul className="an-ratings">
                        <li>Qualität der Unterlagen <span className="an-stars">{stars(share.rating_quality)}</span></li>
                        <li>Fachliche Passung <span className="an-stars">{stars(share.rating_fit)}</span></li>
                        <li>Gesamteindruck <span className="an-stars">{stars(share.rating_overall)}</span></li>
                    </ul>
                </div>
            )}
        </section>
    );
}
