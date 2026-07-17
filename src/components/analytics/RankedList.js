'use client';

import { useState } from 'react';
import { formatNumber } from '@/lib/analytics/format';

const PAGE_SIZES = [10, 25, 50];

// Rangliste mit Inline-Proportionsbalken (Top-Seiten, Referrer-Domains, CTAs,
// Interaktionen …). Für „Identität + Menge, sortiert" ist das lesbarer als ein
// Diagramm — der Balken zeigt den Anteil, die Zahl den Wert.
//
// Client-Component mit Pagination: Bei längeren Listen blättert man seitenweise
// und kann die Anzahl der Einträge pro Seite selbst wählen. Die Balkenlänge
// bezieht sich immer auf das Maximum der GESAMTEN Liste, damit die Skala über
// die Seiten hinweg konsistent bleibt.
export default function RankedList({ rows, emptyText = 'Noch keine Daten', pageSize = 10 }) {
    const [size, setSize] = useState(pageSize);
    const [page, setPage] = useState(0);

    if (!rows || rows.length === 0) {
        return <p className="an-empty">{emptyText}</p>;
    }

    const max = Math.max(...rows.map((r) => r.value)) || 1;
    const useAll = size === 0;
    const pages = useAll ? 1 : Math.ceil(rows.length / size);
    const current = Math.min(page, pages - 1);
    const shown = useAll ? rows : rows.slice(current * size, current * size + size);
    const paginated = rows.length > PAGE_SIZES[0];

    const changeSize = (e) => {
        setSize(Number(e.target.value));
        setPage(0);
    };

    return (
        <>
            <ul className="an-ranked">
                {shown.map((row, i) => (
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

            {paginated && (
                <div className="an-pager">
                    <button type="button" disabled={useAll || current <= 0} onClick={() => setPage(current - 1)}>← Zurück</button>
                    <span>{useAll ? `${rows.length} Einträge` : `Seite ${current + 1} / ${pages}`}</span>
                    <button type="button" disabled={useAll || current >= pages - 1} onClick={() => setPage(current + 1)}>Weiter →</button>
                    <label className="an-pagesize">
                        pro Seite:
                        <select value={size} onChange={changeSize}>
                            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                            <option value={0}>Alle</option>
                        </select>
                    </label>
                </div>
            )}
        </>
    );
}
