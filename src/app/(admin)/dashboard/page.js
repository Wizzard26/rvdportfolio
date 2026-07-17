import { getOverviewData } from '@/lib/analytics/queries';
import { resolveRange } from '@/lib/analytics/range';
import { formatNumber, formatDuration } from '@/lib/analytics/format';
import { REFERRER_LABELS, REFERRER_COLORS, DEVICE_LABELS, DEVICE_COLORS } from '@/components/analytics/palette';
import AnHead from '@/components/analytics/AnHead';
import StatTile from '@/components/analytics/StatTile';
import RankedList from '@/components/analytics/RankedList';
import TrendChart from '@/components/analytics/charts/TrendChart';
import DonutChart from '@/components/analytics/charts/DonutChart';

export const dynamic = 'force-dynamic';

export default async function Overview({ searchParams }) {
    const { days, range } = await resolveRange(searchParams);
    const d = getOverviewData(range);
    const o = d.overview;
    const total = d.newVsReturning.neu + d.newVsReturning.returning;

    const referrerDonut = d.referrerSources.map((r) => ({
        label: REFERRER_LABELS[r.source] || r.source, value: r.n, color: REFERRER_COLORS[r.source] || '#9aa4ab',
    }));
    const deviceDonut = d.devices.map((r) => ({
        label: DEVICE_LABELS[r.label] || r.label, value: r.n, color: DEVICE_COLORS[r.label] || '#9aa4ab',
    }));

    return (
        <div className="an-dashboard">
            <AnHead title="Überblick" subtitle={`Cookiefreie, anonyme First-Party-Auswertung · letzte ${days} Tage`} days={days} basePath="/dashboard" />

            <div className="an-tiles">
                <StatTile label="Besucher" value={formatNumber(o.visitors)} hint="eindeutig (anonym)" />
                <StatTile label="Seitenaufrufe" value={formatNumber(o.pageviews)} />
                <StatTile label="Ø Verweildauer" value={formatDuration(o.avgTimeMs)} hint="pro Seite" />
                <StatTile label="Bounce-Rate" value={`${o.bounceRate}%`} />
                <StatTile label="Wiederkehrend" value={total ? `${Math.round((d.newVsReturning.returning / total) * 100)}%` : '0%'} hint={`${formatNumber(d.newVsReturning.returning)} von ${formatNumber(total)}`} />
                <StatTile label="Seiten / Sitzung" value={o.pagesPerSession} />
                <StatTile label="Conversions" value={formatNumber(o.conversions)} hint="Kontaktanfragen" />
                <StatTile label="CTA-Klicks" value={formatNumber(o.ctaClicks)} />
            </div>

            <section className="an-card an-full">
                <h2>Verlauf</h2>
                <TrendChart data={d.timeseries} />
            </section>

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Herkunft</h2>
                    {referrerDonut.length ? <DonutChart data={referrerDonut} /> : <p className="an-empty">Noch keine Daten</p>}
                </section>
                <section className="an-card">
                    <h2>Endgerät</h2>
                    {deviceDonut.length ? <DonutChart data={deviceDonut} /> : <p className="an-empty">Noch keine Daten</p>}
                </section>
            </div>

            <section className="an-card">
                <h2>Top-Seiten</h2>
                <RankedList rows={d.topPages.map((r) => ({ label: r.path, value: r.views }))} />
            </section>
        </div>
    );
}
