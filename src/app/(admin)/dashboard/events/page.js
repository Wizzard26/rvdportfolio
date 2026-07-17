import Link from 'next/link';
import { getRawEvents, getEventTypeCounts } from '@/lib/analytics/queries';
import { resolveRange } from '@/lib/analytics/range';
import { formatNumber } from '@/lib/analytics/format';
import AnHead from '@/components/analytics/AnHead';

export const dynamic = 'force-dynamic';

// Wählbare Anzahl Einträge pro Seite.
const PAGE_SIZES = [25, 50, 100, 200];
const DEFAULT_SIZE = 50;

function timeLabel(ts) {
    // Kompakt, UTC (wie die Speicherung).
    return new Date(ts).toISOString().replace('T', ' ').slice(0, 19);
}

export default async function Events({ searchParams }) {
    const { days, range, params } = await resolveRange(searchParams);
    const type = typeof params.type === 'string' ? params.type : '';
    const size = PAGE_SIZES.includes(Number(params.size)) ? Number(params.size) : DEFAULT_SIZE;
    const page = Math.max(1, Number(params.page) || 1);
    const offset = (page - 1) * size;

    const { rows, total } = getRawEvents(range, { type: type || undefined, limit: size, offset });
    const typeCounts = getEventTypeCounts(range);
    const pages = Math.max(1, Math.ceil(total / size));

    // Links behalten Zeitraum, Typ, Seitengröße bei (nur `page`/geänderter Wert variiert).
    const linkFor = ({ t = type, p = page, s = size } = {}) => {
        const q = new URLSearchParams();
        q.set('range', String(days));
        if (t) q.set('type', t);
        if (s !== DEFAULT_SIZE) q.set('size', String(s));
        if (p && p > 1) q.set('page', String(p));
        return `/dashboard/events?${q.toString()}`;
    };

    return (
        <div className="an-dashboard">
            <AnHead title="Ereignisse" subtitle={`Roh-Explorer · ${formatNumber(total)} Ereignisse · letzte ${days} Tage`} days={days} basePath="/dashboard/events" />

            <section className="an-card">
                <div className="an-filters">
                    <Link href={linkFor({ t: '', p: 1 })} className={`an-filter-btn${!type ? ' is-active' : ''}`}>Alle</Link>
                    {typeCounts.map((t) => (
                        <Link key={t.label} href={linkFor({ t: t.label, p: 1 })} className={`an-filter-btn${type === t.label ? ' is-active' : ''}`}>
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

                <div className="an-pager">
                    <Link href={linkFor({ p: page - 1 })} className={`${page <= 1 ? 'is-disabled' : ''}`}>← Zurück</Link>
                    <span>Seite {page} / {pages}</span>
                    <Link href={linkFor({ p: page + 1 })} className={`${page >= pages ? 'is-disabled' : ''}`}>Weiter →</Link>
                    <span className="an-pagesize">
                        pro Seite:
                        {PAGE_SIZES.map((s) => (
                            <Link
                                key={s}
                                href={linkFor({ s, p: 1 })}
                                className={`an-filter-btn${size === s ? ' is-active' : ''}`}
                                style={{ padding: '2px 8px' }}
                            >
                                {s}
                            </Link>
                        ))}
                    </span>
                </div>
            </section>
        </div>
    );
}
