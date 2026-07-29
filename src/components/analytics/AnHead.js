import RangeSelector from './RangeSelector';

// Einheitlicher Seitenkopf der Dashboard-Bereiche: Titel + Untertitel +
// Zeitraum-Auswahl. `basePath` sorgt dafür, dass die Zeitraum-Links auf der
// jeweiligen Unterseite bleiben. `active` ist der aktive Zeitraum-Schlüssel
// (7|30|90|'all'); `days` bleibt als Fallback für Altaufrufe erhalten.
export default function AnHead({ title, subtitle, active, days, basePath }) {
    return (
        <div className="an-head">
            <div>
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
            <RangeSelector active={active ?? days} basePath={basePath} />
        </div>
    );
}
