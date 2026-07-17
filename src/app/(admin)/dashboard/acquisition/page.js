import { getAcquisitionData } from '@/lib/analytics/queries';
import { resolveRange } from '@/lib/analytics/range';
import { REFERRER_LABELS, REFERRER_COLORS } from '@/components/analytics/palette';
import AnHead from '@/components/analytics/AnHead';
import RankedList from '@/components/analytics/RankedList';
import DonutChart from '@/components/analytics/charts/DonutChart';

export const dynamic = 'force-dynamic';

export default async function Acquisition({ searchParams }) {
    const { days, range } = await resolveRange(searchParams);
    const d = getAcquisitionData(range);

    const sourceDonut = d.referrerSources.map((r) => ({
        label: REFERRER_LABELS[r.source] || r.source, value: r.n, color: REFERRER_COLORS[r.source] || '#9aa4ab',
    }));

    return (
        <div className="an-dashboard">
            <AnHead title="Herkunft" subtitle={`Woher die Besucher kommen · letzte ${days} Tage`} days={days} basePath="/dashboard/acquisition" />

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Herkunftsart</h2>
                    <p className="an-card-note">Direkt, Suche, KI-Assistenten, Social, Verweise</p>
                    {sourceDonut.length ? <DonutChart data={sourceDonut} /> : <p className="an-empty">Noch keine Daten</p>}
                </section>
                <section className="an-card">
                    <h2>Top-Domains</h2>
                    <RankedList emptyText="Keine externen Referrer" rows={d.referrerDomains.map((r) => ({ label: r.domain, sub: REFERRER_LABELS[r.source] || r.source, value: r.n }))} />
                </section>
            </div>

            <section className="an-card">
                <h2>Referrer-URLs (Detail)</h2>
                <p className="an-card-note">Konkrete Herkunftsseiten (ohne Query-Parameter)</p>
                <RankedList emptyText="Keine externen Referrer" rows={d.referrerUrls.map((r) => ({ label: r.label, sub: REFERRER_LABELS[r.source] || r.source, value: r.n }))} />
            </section>

            <div className="an-grid-2">
                <section className="an-card">
                    <h2>Einstiegsseiten</h2>
                    <RankedList rows={d.entryPages.map((r) => ({ label: r.path, value: r.n }))} />
                </section>
                <section className="an-card">
                    <h2>Ausstiegsseiten</h2>
                    <RankedList rows={d.exitPages.map((r) => ({ label: r.path, value: r.n }))} />
                </section>
            </div>

            <section className="an-card">
                <h2>Herkunft × Einstiegsseite</h2>
                <p className="an-card-note">Welche Quelle wo landet</p>
                <RankedList
                    emptyText="Noch keine Daten"
                    rows={d.sourceByEntry.map((r) => ({ label: r.path, sub: REFERRER_LABELS[r.source] || r.source, value: r.n }))}
                />
            </section>
        </div>
    );
}
