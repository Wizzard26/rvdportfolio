import RangeSelector from './RangeSelector';

// Einheitlicher Seitenkopf der Dashboard-Bereiche: Titel + Untertitel +
// Zeitraum-Auswahl. `basePath` sorgt dafür, dass die Zeitraum-Links auf der
// jeweiligen Unterseite bleiben.
export default function AnHead({ title, subtitle, days, basePath }) {
    return (
        <div className="an-head">
            <div>
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
            <RangeSelector active={days} basePath={basePath} />
        </div>
    );
}
