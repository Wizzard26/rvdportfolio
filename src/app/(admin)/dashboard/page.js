import './dashboard.css';
import { getDashboardData } from '@/lib/analytics/queries';
import { rangeFromDays, formatNumber, formatDuration, countryFlag } from '@/lib/analytics/format';
import {
    REFERRER_LABELS, REFERRER_COLORS, DEVICE_LABELS, DEVICE_COLORS,
} from '@/components/analytics/palette';
import StatTile from '@/components/analytics/StatTile';
import RankedList from '@/components/analytics/RankedList';
import RangeSelector from '@/components/analytics/RangeSelector';
import TrendChart from '@/components/analytics/charts/TrendChart';
import DonutChart from '@/components/analytics/charts/DonutChart';
import BarChartH from '@/components/analytics/charts/BarChartH';

// Immer frisch rendern — die Kennzahlen ändern sich laufend.
export const dynamic = 'force-dynamic';

const VALID_RANGES = [7, 30, 90];

export default async function Dashboard({ searchParams }) {
    const params = await searchParams;
    const days = VALID_RANGES.includes(Number(params?.range)) ? Number(params.range) : 30;
    const range = rangeFromDays(days);

    const d = getDashboardData(range);
    const o = d.overview;

    const referrerDonut = d.referrerSources.map((r) => ({
        label: REFERRER_LABELS[r.source] || r.source,
        value: r.n,
        color: REFERRER_COLORS[r.source] || '#9aa4ab',
    }));
    const deviceDonut = d.devices.map((r) => ({
        label: DEVICE_LABELS[r.label] || r.label,
        value: r.n,
        color: DEVICE_COLORS[r.label] || '#9aa4ab',
    }));

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Analytics</h1>
                    <p>Cookiefreie, anonyme First-Party-Auswertung · Zeitraum: letzte {days} Tage</p>
                </div>
                <RangeSelector active={days} />
            </div>

            {/* KPI-Kacheln */}
            <div className="an-tiles">
                <StatTile label="Besucher" value={formatNumber(o.visitors)} hint="eindeutig (anonym, pro Tag)" />
                <StatTile label="Seitenaufrufe" value={formatNumber(o.pageviews)} />
                <StatTile label="Ø Verweildauer" value={formatDuration(o.avgTimeMs)} hint="pro Seite" />
                <StatTile label="Bounce-Rate" value={`${o.bounceRate}%`} hint="nur eine Seite besucht" />
                <StatTile label="Seiten / Sitzung" value={o.pagesPerSession} />
                <StatTile label="Conversions" value={formatNumber(o.conversions)} hint="Kontaktanfragen" />
                <StatTile label="CTA-Klicks" value={formatNumber(o.ctaClicks)} />
                <StatTile label="Sitzungen" value={formatNumber(o.sessions)} />
            </div>

            {/* Zeitverlauf */}
            <section className="an-card an-full">
                <h2>Verlauf</h2>
                <TrendChart data={d.timeseries} />
            </section>

            {/* Herkunft + Endgerät */}
            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Herkunft</h2>
                    {referrerDonut.length
                        ? <DonutChart data={referrerDonut} />
                        : <p className="an-empty">Noch keine Daten</p>}
                </section>
                <section className="an-card">
                    <h2>Endgerät</h2>
                    {deviceDonut.length
                        ? <DonutChart data={deviceDonut} />
                        : <p className="an-empty">Noch keine Daten</p>}
                </section>
            </div>

            {/* Referrer-Domains + Länder */}
            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Top-Referrer</h2>
                    <RankedList
                        emptyText="Keine externen Referrer"
                        rows={d.referrerDomains.map((r) => ({
                            label: r.domain,
                            sub: REFERRER_LABELS[r.source] || r.source,
                            value: r.n,
                        }))}
                    />
                </section>
                <section className="an-card">
                    <h2>Länder</h2>
                    <RankedList
                        rows={d.countries.map((r) => ({
                            label: r.label || 'Unbekannt',
                            icon: countryFlag(r.label),
                            value: r.n,
                        }))}
                    />
                </section>
            </div>

            {/* Seiten */}
            <div className="an-grid-3">
                <section className="an-card">
                    <h2>Top-Seiten</h2>
                    <RankedList rows={d.topPages.map((r) => ({ label: r.path, value: r.views }))} />
                </section>
                <section className="an-card">
                    <h2>Einstiegsseiten</h2>
                    <RankedList rows={d.entryPages.map((r) => ({ label: r.path, value: r.n }))} />
                </section>
                <section className="an-card">
                    <h2>Ausstiegsseiten</h2>
                    <RankedList rows={d.exitPages.map((r) => ({ label: r.path, value: r.n }))} />
                </section>
            </div>

            {/* Browser + OS */}
            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Browser</h2>
                    {d.browsers.length
                        ? <BarChartH data={d.browsers} />
                        : <p className="an-empty">Noch keine Daten</p>}
                </section>
                <section className="an-card">
                    <h2>Betriebssystem</h2>
                    {d.operatingSystems.length
                        ? <BarChartH data={d.operatingSystems} />
                        : <p className="an-empty">Noch keine Daten</p>}
                </section>
            </div>

            {/* CTA + Interaktionen */}
            <div className="an-grid-2">
                <section className="an-card">
                    <h2>CTA-Performance</h2>
                    <RankedList
                        emptyText="Noch keine CTA-Klicks"
                        rows={d.ctaPerformance.map((r) => ({
                            label: r.name,
                            sub: r.path,
                            value: r.clicks,
                        }))}
                    />
                </section>
                <section className="an-card">
                    <h2>Referenz-Interaktionen</h2>
                    <RankedList
                        emptyText="Noch keine Interaktionen"
                        rows={d.interactions.map((r) => ({
                            label: r.name,
                            sub: `${r.sessions} Sitzung(en)`,
                            value: r.n,
                        }))}
                    />
                </section>
            </div>
        </div>
    );
}
