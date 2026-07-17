import { Fragment } from 'react';

// Stunde × Wochentag-Heatmap der Seitenaufrufe. `data`: [{ weekday, hour, n }]
// (weekday 0=So, hour 0–23, UTC). Zellen-Sättigung skaliert mit dem Maximum.
const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export default function Heatmap({ data }) {
    if (!data || data.length === 0) return <p className="an-empty">Noch keine Daten</p>;

    // In [weekday][hour] einsortieren.
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
    let max = 0;
    for (const d of data) {
        if (d.weekday >= 0 && d.weekday < 7 && d.hour >= 0 && d.hour < 24) {
            grid[d.weekday][d.hour] = d.n;
            if (d.n > max) max = d.n;
        }
    }

    // Mo–So statt So–Sa (europäische Lesart).
    const order = [1, 2, 3, 4, 5, 6, 0];

    return (
        <div>
            <div className="an-heatmap" role="img" aria-label="Aufrufe nach Wochentag und Stunde">
                <span />
                {Array.from({ length: 24 }, (_, h) => (
                    <span key={h} className="an-heatmap-axis" style={{ justifyContent: 'center' }}>
                        {h % 6 === 0 ? h : ''}
                    </span>
                ))}
                {order.map((wd) => (
                    <Fragment key={wd}>
                        <span className="an-heatmap-axis">{DAYS[wd]}</span>
                        {grid[wd].map((n, h) => (
                            <span
                                key={`${wd}-${h}`}
                                className="an-heatmap-cell"
                                title={`${DAYS[wd]} ${h}:00 — ${n} Aufrufe`}
                                style={n > 0 ? { background: `rgba(63, 104, 126, ${0.15 + (n / max) * 0.85})` } : undefined}
                            />
                        ))}
                    </Fragment>
                ))}
            </div>
            <p className="an-card-note" style={{ marginTop: 10 }}>Stunden in UTC · Sättigung = Aufrufe</p>
        </div>
    );
}
