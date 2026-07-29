import Link from 'next/link';

// Zeitraum-Auswahl über einen Query-Parameter (?range=7|30|90|all). Als Links
// umgesetzt, damit die Server-Component die Daten für den Zeitraum frisch lädt —
// kein Client-State nötig. `all` = gesamter Zeitraum (ohne Tages-Begrenzung).
const OPTIONS = [
    { key: 7, label: '7 Tage' },
    { key: 30, label: '30 Tage' },
    { key: 90, label: '90 Tage' },
    { key: 'all', label: 'Gesamt' },
];

export default function RangeSelector({ active, basePath = '/dashboard' }) {
    return (
        <div className="an-range">
            {OPTIONS.map((opt) => (
                <Link
                    key={opt.key}
                    href={`${basePath}?range=${opt.key}`}
                    className={`an-range-btn${active === opt.key ? ' is-active' : ''}`}
                >
                    {opt.label}
                </Link>
            ))}
        </div>
    );
}
