import { getBehaviorData } from '@/lib/analytics/queries';
import { resolveRange } from '@/lib/analytics/range';
import { formatDuration } from '@/lib/analytics/format';
import AnHead from '@/components/analytics/AnHead';
import RankedList from '@/components/analytics/RankedList';
import Funnel from '@/components/analytics/Funnel';
import Heatmap from '@/components/analytics/Heatmap';
import BarChartH from '@/components/analytics/charts/BarChartH';

export const dynamic = 'force-dynamic';

export default async function Behavior({ searchParams }) {
    const { days, range } = await resolveRange(searchParams);
    const d = getBehaviorData(range);

    return (
        <div className="an-dashboard">
            <AnHead title="Verhalten" subtitle={`Wie Besucher sich bewegen · letzte ${days} Tage`} days={days} basePath="/dashboard/behavior" />

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Conversion-Funnel</h2>
                    <p className="an-card-note">Sitzungen je Stufe (Rate ab Besuch · Absprung)</p>
                    <Funnel steps={d.funnel} />
                </section>
                <section className="an-card">
                    <h2>Scrolltiefe</h2>
                    <p className="an-card-note">Wie weit Seiten gelesen werden</p>
                    <BarChartH data={d.scrollDepth} height={200} />
                </section>
            </div>

            <section className="an-card">
                <h2>Engagement je Seite</h2>
                <p className="an-card-note">Ø Verweildauer, Ø Scrolltiefe und ein kombinierter Score (0–100)</p>
                {d.engagementByPage.length ? (
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead>
                                <tr><th>Seite</th><th>Aufrufe</th><th>Ø Zeit</th><th>Ø Scroll</th><th>Score</th></tr>
                            </thead>
                            <tbody>
                                {d.engagementByPage.map((p) => (
                                    <tr key={p.path}>
                                        <td>{p.path}</td>
                                        <td>{p.views}</td>
                                        <td>{formatDuration(p.avgTimeMs)}</td>
                                        <td>{p.avgScroll}%</td>
                                        <td><span className="an-badge">{p.score}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="an-empty">Noch keine Daten</p>}
            </section>

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Gesehene Abschnitte / Projekte</h2>
                    <RankedList emptyText="Noch keine Sichtungen" rows={d.sectionViews.map((r) => ({ label: r.name, sub: `${r.sessions} Sitzung(en)`, value: r.n }))} />
                </section>
                <section className="an-card">
                    <h2>Referenz-Interaktionen</h2>
                    <RankedList emptyText="Noch keine Interaktionen" rows={d.interactions.map((r) => ({ label: r.name, sub: `${r.sessions} Sitzung(en)`, value: r.n }))} />
                </section>
            </div>

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Häufigste Wege</h2>
                    <p className="an-card-note">Seitenabfolge je Sitzung</p>
                    <RankedList emptyText="Noch keine Wege" rows={d.journeyPaths.map((r) => ({ label: r.label, value: r.n }))} />
                </section>
                <section className="an-card">
                    <h2>Formular-Abbrüche</h2>
                    <p className="an-card-note">Zuletzt bearbeitetes Feld (ohne Inhalte)</p>
                    <RankedList emptyText="Keine Abbrüche" rows={d.formAbandon.map((r) => ({ label: r.label, value: r.n }))} />
                </section>
            </div>

            <section className="an-card">
                <h2>Besuchszeiten</h2>
                <Heatmap data={d.heatmap} />
            </section>
        </div>
    );
}
