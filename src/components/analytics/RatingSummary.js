import { TbStarFilled, TbStarHalfFilled, TbStar } from 'react-icons/tb';

// 5 Sterne, halb gefüllt nach Durchschnittswert (auf 0,5 gerundet).
function Stars({ value }) {
    const v = Math.round(value * 2) / 2;
    return (
        <span className="an-rsum-stars" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => {
                if (v >= n) return <TbStarFilled key={n} />;
                if (v >= n - 0.5) return <TbStarHalfFilled key={n} />;
                return <TbStar key={n} />;
            })}
        </span>
    );
}

// Auswertung aller Sternebewertungen: Gesamtschnitt + Balken je Einzelfaktor.
export default function RatingSummary({ summary }) {
    if (!summary.count) return <p className="an-empty">Noch keine Bewertungen abgegeben.</p>;
    return (
        <div className="an-rsum">
            <div className="an-rsum-head">
                <span className="an-rsum-big">{summary.overall.toFixed(1)}</span>
                <div>
                    <Stars value={summary.overall} />
                    <p className="an-muted">Ø über {summary.count} Bewertung{summary.count === 1 ? '' : 'en'}</p>
                </div>
            </div>
            <ul className="an-rsum-list">
                {summary.factors.map((f) => (
                    <li key={f.key} className="an-rsum-row">
                        <span className="an-rsum-label">{f.label}</span>
                        <span className="an-rsum-bar">
                            <span className="an-rsum-fill" style={{ width: `${(f.avg / 5) * 100}%` }} />
                        </span>
                        <span className="an-rsum-val">
                            {f.rated ? f.avg.toFixed(1) : '–'}
                            {f.rated > 0 && f.rated < summary.count && <em className="an-muted"> ({f.rated})</em>}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
