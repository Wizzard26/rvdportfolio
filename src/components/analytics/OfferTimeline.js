import { FiPlusCircle, FiFlag, FiStar } from 'react-icons/fi';
import { OFFER_STATUS_LABELS } from '@/lib/offerContent';
import { formatBerlinDateTime } from '@/lib/dateFormat';

// Verlauf eines eingegangenen Angebots (aus offer_events).
const META = {
    created: { icon: FiPlusCircle, label: () => 'Angebot eingegangen' },
    status:  { icon: FiFlag,       label: (d) => `Status: ${OFFER_STATUS_LABELS[d] || d}` },
    rating:  { icon: FiStar,       label: () => 'Bewertung gespeichert' },
};

const fmt = (ts) => formatBerlinDateTime(ts);

export default function OfferTimeline({ events = [] }) {
    if (events.length === 0) return <p className="an-muted">Noch keine Ereignisse.</p>;
    return (
        <ol className="an-timeline">
            {events.slice().reverse().map((e, i) => {
                const m = META[e.kind] || { icon: FiFlag, label: () => e.kind };
                const Icon = m.icon;
                return (
                    <li key={i} className="an-timeline-item">
                        <span className="an-timeline-icon"><Icon aria-hidden="true" /></span>
                        <span className="an-timeline-label">{m.label(e.detail)}</span>
                        <time className="an-timeline-time">{fmt(e.at)}</time>
                    </li>
                );
            })}
        </ol>
    );
}
