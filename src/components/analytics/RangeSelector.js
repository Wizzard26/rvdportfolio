import Link from 'next/link';

// Zeitraum-Auswahl über einen Query-Parameter (?range=7|30|90). Als Links
// umgesetzt, damit die Server-Component die Daten für den Zeitraum frisch lädt —
// kein Client-State nötig.
const OPTIONS = [
    { days: 7, label: '7 Tage' },
    { days: 30, label: '30 Tage' },
    { days: 90, label: '90 Tage' },
];

export default function RangeSelector({ active, basePath = '/dashboard' }) {
    return (
        <div className="an-range">
            {OPTIONS.map((opt) => (
                <Link
                    key={opt.days}
                    href={`${basePath}?range=${opt.days}`}
                    className={`an-range-btn${active === opt.days ? ' is-active' : ''}`}
                >
                    {opt.label}
                </Link>
            ))}
        </div>
    );
}
