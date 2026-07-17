// KPI-Kachel (Hero-Zahl). Kein Diagramm — nur die Kennzahl + Label. Text trägt
// Text-Farben, nicht die Serienfarbe.
export default function StatTile({ label, value, hint }) {
    return (
        <div className="an-tile">
            <div className="an-tile-value">{value}</div>
            <div className="an-tile-label">{label}</div>
            {hint && <div className="an-tile-hint">{hint}</div>}
        </div>
    );
}
