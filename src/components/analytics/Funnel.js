// Conversion-Funnel als Stufen-Balken. `steps`: [{ step, n }] (absteigend).
// Zeigt je Stufe die absolute Zahl und die Rate relativ zur ersten Stufe.
export default function Funnel({ steps }) {
    const start = steps[0]?.n || 0;
    if (!start) return <p className="an-empty">Noch keine Daten</p>;

    return (
        <div className="an-funnel">
            {steps.map((s, i) => {
                const pct = start ? Math.round((s.n / start) * 100) : 0;
                const prev = i > 0 ? steps[i - 1].n : s.n;
                const dropoff = prev ? Math.round(((prev - s.n) / prev) * 100) : 0;
                return (
                    <div key={s.step} className="an-funnel-step">
                        <div className="an-funnel-label">{s.step}</div>
                        <div className="an-funnel-bar" style={{ width: `${Math.max(3, pct)}%` }}>
                            {s.n}
                        </div>
                        <div className="an-funnel-meta">
                            {pct}%{i > 0 && dropoff > 0 ? ` · −${dropoff}%` : ''}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
