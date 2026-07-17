import { getAudienceData } from '@/lib/analytics/queries';
import { resolveRange } from '@/lib/analytics/range';
import { formatNumber, countryFlag } from '@/lib/analytics/format';
import { DEVICE_LABELS, DEVICE_COLORS } from '@/components/analytics/palette';
import AnHead from '@/components/analytics/AnHead';
import RankedList from '@/components/analytics/RankedList';
import DonutChart from '@/components/analytics/charts/DonutChart';
import BarChartH from '@/components/analytics/charts/BarChartH';

export const dynamic = 'force-dynamic';

// Bewertungsschwellen (Core Web Vitals) für die Ampel-Punkte.
const VITAL_UNIT = { LCP: 'ms', INP: 'ms', FCP: 'ms', TTFB: 'ms', CLS: '' };

export default async function Audience({ searchParams }) {
    const { days, range } = await resolveRange(searchParams);
    const d = getAudienceData(range);
    const total = d.newVsReturning.neu + d.newVsReturning.returning;

    const nvr = [
        { label: 'Neu', value: d.newVsReturning.neu, color: '#1f6fb2' },
        { label: 'Wiederkehrend', value: d.newVsReturning.returning, color: '#3f9d5a' },
    ].filter((x) => x.value > 0);

    const deviceDonut = d.devices.map((r) => ({
        label: DEVICE_LABELS[r.label] || r.label, value: r.n, color: DEVICE_COLORS[r.label] || '#9aa4ab',
    }));

    return (
        <div className="an-dashboard">
            <AnHead title="Zielgruppe" subtitle={`Wer besucht die Seite · letzte ${days} Tage`} days={days} basePath="/dashboard/audience" />

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Neu vs. wiederkehrend</h2>
                    <p className="an-card-note">Wiederkehr innerhalb von ~30 Tagen (anonym, ohne Cookie)</p>
                    {nvr.length ? <DonutChart data={nvr} /> : <p className="an-empty">Noch keine Daten</p>}
                </section>
                <section className="an-card">
                    <h2>Besuchshäufigkeit</h2>
                    <p className="an-card-note">An wie vielen Tagen ein Besucher aktiv war</p>
                    <RankedList rows={d.visitFrequency.map((r) => ({ label: `${r.label} Tag(e)`, value: r.n }))} />
                </section>
            </div>

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Endgerät</h2>
                    {deviceDonut.length ? <DonutChart data={deviceDonut} /> : <p className="an-empty">Noch keine Daten</p>}
                </section>
                <section className="an-card">
                    <h2>Länder</h2>
                    <RankedList rows={d.countries.map((r) => ({ label: r.label || 'Unbekannt', icon: countryFlag(r.label), value: r.n }))} />
                </section>
            </div>

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Browser</h2>
                    {d.browsers.length ? <BarChartH data={d.browsers} /> : <p className="an-empty">Noch keine Daten</p>}
                </section>
                <section className="an-card">
                    <h2>Betriebssystem</h2>
                    {d.operatingSystems.length ? <BarChartH data={d.operatingSystems} /> : <p className="an-empty">Noch keine Daten</p>}
                </section>
            </div>

            <section className="an-card">
                <h2>Ladeperformance (Core Web Vitals)</h2>
                <p className="an-card-note">Echte Messwerte der Besucher (Real-User-Monitoring)</p>
                {d.webVitals.length ? (
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead>
                                <tr><th>Metrik</th><th>Ø Wert</th><th>Messungen</th><th>Bewertung</th></tr>
                            </thead>
                            <tbody>
                                {d.webVitals.map((v) => (
                                    <tr key={v.name}>
                                        <td><span className="an-badge">{v.name}</span></td>
                                        <td>{v.name === 'CLS' ? (v.avg ?? 0).toFixed(3) : `${Math.round(v.avg || 0)}${VITAL_UNIT[v.name] || ''}`}</td>
                                        <td>{formatNumber(v.n)}</td>
                                        <td>
                                            <span className="an-vital-rating">
                                                <span className="an-dot good" /> {v.good}
                                                <span className="an-dot ni" style={{ marginLeft: 8 }} /> {v.ni}
                                                <span className="an-dot poor" style={{ marginLeft: 8 }} /> {v.poor}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="an-empty">Noch keine Messungen</p>}
            </section>
        </div>
    );
}
