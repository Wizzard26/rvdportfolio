import { FiPlusCircle, FiSend, FiEye, FiDownload, FiFlag, FiLock, FiUnlock, FiMessageCircle, FiCalendar, FiXCircle, FiCornerUpLeft, FiCheckCircle } from 'react-icons/fi';
import { STATUS_LABELS } from '@/lib/applicationStatus';

// Verlauf einer Freigabe/Bewerbung (aus share_events).
const META = {
    created:     { icon: FiPlusCircle,   label: () => 'Erstellt' },
    sent:        { icon: FiSend,         label: (d) => `Zugestellt${d ? ` (${d})` : ''}` },
    status:      { icon: FiFlag,         label: (d) => `Status: ${STATUS_LABELS[d] || d}` },
    view:        { icon: FiEye,          label: () => 'Vom Empfänger aufgerufen' },
    download:    { icon: FiDownload,     label: (d) => `Unterlagen heruntergeladen${d === 'zip' ? ' (ZIP)' : ''}` },
    question:    { icon: FiMessageCircle,label: (d) => `Rückfrage: ${d || ''}` },
    reply:       { icon: FiCornerUpLeft, label: (d) => `Antwort: ${d || ''}` },
    appointment: { icon: FiCalendar,     label: (d) => `Terminvorschlag: ${d || ''}` },
    slot_confirmed: { icon: FiCheckCircle, label: (d) => `Termin bestätigt${d ? `: ${d.replace('T', ' ')} Uhr` : ''}` },
    rejection:   { icon: FiXCircle,      label: (d) => `Absage${d ? `: ${d}` : ''}` },
    closed:      { icon: FiLock,         label: () => 'Zugang geschlossen' },
    reopened:    { icon: FiUnlock,       label: () => 'Wieder aktiviert' },
};

function fmt(ts) {
    return new Date(ts).toLocaleString('de-DE', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

export default function ShareTimeline({ events = [] }) {
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
