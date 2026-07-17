import { getGoalsData } from '@/lib/analytics/queries';
import { resolveRange } from '@/lib/analytics/range';
import { formatNumber } from '@/lib/analytics/format';
import AnHead from '@/components/analytics/AnHead';
import StatTile from '@/components/analytics/StatTile';
import RankedList from '@/components/analytics/RankedList';
import Funnel from '@/components/analytics/Funnel';

export const dynamic = 'force-dynamic';

export default async function Goals({ searchParams }) {
    const { days, range } = await resolveRange(searchParams);
    const d = getGoalsData(range);

    return (
        <div className="an-dashboard">
            <AnHead title="Ziele" subtitle={`Was Besucher tun, das zählt · letzte ${days} Tage`} days={days} basePath="/dashboard/goals" />

            <div className="an-tiles">
                <StatTile label="Conversions" value={formatNumber(d.overview.conversions)} hint="Kontaktanfragen" />
                <StatTile label="CTA-Klicks" value={formatNumber(d.overview.ctaClicks)} />
                <StatTile label="Outbound-Klicks" value={formatNumber(d.outbound.reduce((s, r) => s + r.n, 0))} hint="externe Profile" />
                <StatTile label="Downloads" value={formatNumber(d.downloads.reduce((s, r) => s + r.n, 0))} hint="PDFs" />
            </div>

            <section className="an-card">
                <h2>Conversion-Funnel</h2>
                <p className="an-card-note">Besuch → Showcase → Kontakt → Formular → Absenden</p>
                <Funnel steps={d.funnel} />
            </section>

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>CTA-Performance</h2>
                    <RankedList emptyText="Noch keine CTA-Klicks" rows={d.ctaPerformance.map((r) => ({ label: r.name, sub: r.path, value: r.clicks }))} />
                </section>
                <section className="an-card">
                    <h2>Projekt-Interesse</h2>
                    <p className="an-card-note">Meistgesehene Showcase-Projekte</p>
                    <RankedList emptyText="Noch keine Sichtungen" rows={d.sectionViews.map((r) => ({ label: r.name, value: r.n }))} />
                </section>
            </div>

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Outbound-Klicks</h2>
                    <p className="an-card-note">Externe Ziele (GitHub, LinkedIn, Xing …)</p>
                    <RankedList emptyText="Noch keine Outbound-Klicks" rows={d.outbound.map((r) => ({ label: r.label, value: r.n }))} />
                </section>
                <section className="an-card">
                    <h2>Downloads</h2>
                    <p className="an-card-note">Vita & Zertifikate</p>
                    <RankedList emptyText="Noch keine Downloads" rows={d.downloads.map((r) => ({ label: r.label, value: r.n }))} />
                </section>
            </div>
        </div>
    );
}
