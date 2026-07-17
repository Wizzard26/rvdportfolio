import { formatNumber } from '@/lib/analytics/format';

// Rangliste mit Inline-Proportionsbalken (Top-Seiten, Referrer-Domains, CTAs,
// Interaktionen …). Für „Identität + Menge, sortiert" ist das lesbarer als ein
// Diagramm — der Balken zeigt den Anteil, die Zahl den Wert.
export default function RankedList({ rows, emptyText = 'Noch keine Daten' }) {
    if (!rows || rows.length === 0) {
        return <p className="an-empty">{emptyText}</p>;
    }
    const max = Math.max(...rows.map((r) => r.value)) || 1;

    return (
        <ul className="an-ranked">
            {rows.map((row, i) => (
                <li key={`${row.label}-${i}`}>
                    <div className="an-ranked-bar" style={{ width: `${Math.max(3, (row.value / max) * 100)}%` }} />
                    <span className="an-ranked-label" title={row.label}>
                        {row.icon && <span className="an-ranked-icon">{row.icon}</span>}
                        {row.label}
                        {row.sub && <span className="an-ranked-sub">{row.sub}</span>}
                    </span>
                    <span className="an-ranked-value">{formatNumber(row.value)}</span>
                </li>
            ))}
        </ul>
    );
}
