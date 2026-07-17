import Link from 'next/link';
import { getRawEvents, getEventTypeCounts } from '@/lib/analytics/queries';
import { resolveRange } from '@/lib/analytics/range';
import { formatNumber } from '@/lib/analytics/format';
import AnHead from '@/components/analytics/AnHead';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 100;

function timeLabel(ts) {
    // Kompakt, UTC (wie die Speicherung).
    return new Date(ts).toISOString().replace('T', ' ').slice(0, 19);
}

export default async function Events({ searchParams }) {
    const { days, range, params } = await resolveRange(searchParams);
    const type = typeof params.type === 'string' ? params.type : '';
    const page = Math.max(1, Number(params.page) || 1);
    const offset = (page - 1) * PAGE_SIZE;

    const { rows, total } = getRawEvents(range, { type: type || undefined, limit: PAGE_SIZE, offset });
    const typeCounts = getEventTypeCounts(range);
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    // Filter-/Pager-Links behalten den Zeitraum bei.
    const linkFor = (t, p) => {
        const q = new URLSearchParams();
        q.set('range', String(days));
        if (t) q.set('type', t);
        if (p && p > 1) q.set('page', String(p));
        return `/dashboard/events?${q.toString()}`;
    };

    return (
        <div className="an-dashboard">
            <AnHead title="Ereignisse" subtitle={`Roh-Explorer · ${formatNumber(total)} Ereignisse · letzte ${days} Tage`} days={days} basePath="/dashboard/events" />

            <section className="an-card">
                <div className="an-filters">
                    <Link href={linkFor('', 1)} className={`an-filter-btn${!type ? ' is-active' : ''}`}>Alle</Link>
                    {typeCounts.map((t) => (
                        <Link key={t.label} href={linkFor(t.label, 1)} className={`an-filter-btn${type === t.label ? ' is-active' : ''}`}>
                            {t.label} ({formatNumber(t.n)})
                        </Link>
                    ))}
                </div>

                {rows.length ? (
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead>
                                <tr><th>Zeit (UTC)</th><th>Typ</th><th>Seite</th><th>Herkunft</th><th>Gerät</th><th>Land</th><th>Detail</th><th>Wert</th></tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={`${r.ts}-${i}`}>
                                        <td>{timeLabel(r.ts)}</td>
                                        <td><span className="an-badge">{r.type}</span></td>
                                        <td>{r.path || '—'}</td>
                                        <td>{r.ref_source || '—'}{r.ref_domain ? ` · ${r.ref_domain}` : ''}</td>
                                        <td>{r.device || '—'}{r.browser ? ` · ${r.browser}` : ''}</td>
                                        <td>{r.country || '—'}</td>
                                        <td>{r.name || '—'}</td>
                                        <td>{r.value ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="an-empty">Keine Ereignisse im Zeitraum</p>}

                {pages > 1 && (
                    <div className="an-pager">
                        <Link href={linkFor(type, page - 1)} className={`${page <= 1 ? 'is-disabled' : ''}`}>← Zurück</Link>
                        <span>Seite {page} / {pages}</span>
                        <Link href={linkFor(type, page + 1)} className={`${page >= pages ? 'is-disabled' : ''}`}>Weiter →</Link>
                    </div>
                )}
            </section>
        </div>
    );
}
