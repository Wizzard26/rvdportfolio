import { requireAdminPage } from '@/lib/adminAuth';
import Link from 'next/link';
import { getRawEvents, getEventTypeCounts, getPageVisits } from '@/lib/analytics/queries';
import { resolveRange } from '@/lib/analytics/range';
import { formatNumber, formatDuration, tzCountry } from '@/lib/analytics/format';
import { formatBerlinDateTime } from '@/lib/dateFormat';
import AnHead from '@/components/analytics/AnHead';
import DataResetCard from '@/components/analytics/DataResetCard';
import { countEvents } from '@/lib/analytics/adminData';
import { resetVisitorDataAction } from '@/lib/analytics/analyticsAdminActions';
import TrackingOptOutToggle from '@/components/analytics/TrackingOptOut';

export const dynamic = 'force-dynamic';

// Wählbare Anzahl Einträge pro Seite.
const PAGE_SIZES = [25, 50, 100, 200];
const DEFAULT_SIZE = 50;

// Lesbare Kurzform der Aktionen eines Seitenbesuchs (CTA, Outbound, …).
const ACTION_LABEL = {
    cta: 'CTA', outbound: 'Link raus', download: 'Download', interaction: 'Interaktion',
    section_view: 'Abschnitt', conversion: 'Conversion', form_start: 'Formular', form_abandon: 'Formular-Abbruch',
    assistant: 'KI-Assistent',
};

function timeLabel(ts) {
    // Deutsche Zeit (Europe/Berlin). Gespeichert wird UTC; hier zur Anzeige
    // umgerechnet, sonst zeigte der UTC-Container die Zeiten 2 h zu früh.
    return formatBerlinDateTime(ts, { withSeconds: true });
}

export default async function Events({ searchParams }) {
    await requireAdminPage();
    const { range, rangeKey, phrase, params } = await resolveRange(searchParams);
    const type = typeof params.type === 'string' ? params.type : '';
    // Standard = Seitenbesuche (eine Zeile je Aufruf); „roh" bzw. ein Typ-Filter
    // zeigt die einzelnen Ereignisse.
    const raw = !!type || params.view === 'roh';
    const size = PAGE_SIZES.includes(Number(params.size)) ? Number(params.size) : DEFAULT_SIZE;
    const page = Math.max(1, Number(params.page) || 1);
    const offset = (page - 1) * size;

    const { rows, total } = raw
        ? getRawEvents(range, { type: type || undefined, limit: size, offset })
        : getPageVisits(range, { limit: size, offset });
    const typeCounts = getEventTypeCounts(range);
    const pages = Math.max(1, Math.ceil(total / size));

    // Datenverwaltung: Reset betrifft den GESAMTEN Bestand, nicht nur den Zeitraum.
    const eventsAllTime = countEvents();

    // Links behalten Zeitraum, Typ, Seitengröße bei (nur `page`/geänderter Wert variiert).
    const linkFor = ({ t = type, p = page, s = size, v = raw && !type ? 'roh' : '' } = {}) => {
        const q = new URLSearchParams();
        q.set('range', String(rangeKey));
        if (t) q.set('type', t);
        else if (v) q.set('view', v);
        if (s !== DEFAULT_SIZE) q.set('size', String(s));
        if (p && p > 1) q.set('page', String(p));
        return `/dashboard/events?${q.toString()}`;
    };

    return (
        <div className="an-dashboard">
            <AnHead title="Ereignisse" subtitle={`${raw ? `Roh-Explorer · ${formatNumber(total)} Ereignisse` : `${formatNumber(total)} Seitenbesuche`} · ${phrase}`} active={rangeKey} basePath="/dashboard/events" />

            <section className="an-card">
                <div className="an-filters">
                    <Link href={linkFor({ t: '', v: '', p: 1 })} className={`an-filter-btn${!raw ? ' is-active' : ''}`}>Seitenbesuche</Link>
                    <Link href={linkFor({ t: '', v: 'roh', p: 1 })} className={`an-filter-btn${raw && !type ? ' is-active' : ''}`}>Alle Roh-Ereignisse</Link>
                    {typeCounts.map((t) => (
                        <Link key={t.label} href={linkFor({ t: t.label, p: 1 })} className={`an-filter-btn${type === t.label ? ' is-active' : ''}`}>
                            {t.label} ({formatNumber(t.n)})
                        </Link>
                    ))}
                </div>

                {!raw && (
                    <p className="an-card-note" style={{ margin: '0 0 12px' }}>
                        Ein Seitenaufruf erzeugt technisch mehrere Ereignisse (Aufruf, Scrolltiefe 25/50/75/100&nbsp;%, Web Vitals,
                        Verlassen). Hier sind sie je Aufruf zusammengefasst. Land = aus der IP; weicht die Browser-Zeitzone ab
                        (⚠), lief der Aufruf meist über VPN, Firmen-Proxy oder iCloud Private Relay.
                    </p>
                )}

                {!raw && rows.length > 0 && (
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead>
                                <tr><th>Zeit</th><th>Seite</th><th>Herkunft</th><th>Gerät</th><th>Land</th><th>Dauer</th><th>Scroll</th><th>LCP</th><th>Aktionen</th></tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => {
                                    const tzc = tzCountry(r.tz);
                                    const mismatch = !!(tzc && r.country && tzc !== r.country);
                                    return (
                                        <tr key={`${r.ts}-${i}`}>
                                            <td>{timeLabel(r.ts)}</td>
                                            <td>{r.path || '—'}</td>
                                            <td>{r.ref_source || '—'}{r.ref_domain ? ` · ${r.ref_domain}` : ''}</td>
                                            <td>{r.device || '—'}{r.browser ? ` · ${r.browser}` : ''}</td>
                                            <td title={r.tz ? `Browser-Zeitzone: ${r.tz}` : 'Zeitzone unbekannt (ältere Daten)'}>
                                                {r.country || '—'}
                                                {mismatch && <span className="an-badge an-badge--warn" style={{ marginLeft: 4 }}>⚠ TZ {tzc}</span>}
                                            </td>
                                            <td>{r.duration_ms ? formatDuration(r.duration_ms) : '—'}</td>
                                            <td>{r.max_scroll != null ? `${r.max_scroll}%` : '—'}</td>
                                            <td>{r.lcp != null ? `${(r.lcp / 1000).toFixed(1)}s` : '—'}</td>
                                            <td>
                                                {r.actions.length
                                                    ? r.actions.map((a, j) => (
                                                        <span key={j} className="an-badge" title={a.name || ''} style={{ marginRight: 4 }}>{ACTION_LABEL[a.type] || a.type}</span>
                                                    ))
                                                    : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {raw && rows.length > 0 && (
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead>
                                <tr><th>Zeit</th><th>Typ</th><th>Seite</th><th>Herkunft</th><th>Gerät</th><th>Land</th><th>Detail</th><th>Wert</th></tr>
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
                )}
                {rows.length === 0 && <p className="an-empty">Keine Ereignisse im Zeitraum</p>}

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

            <section className="an-card">
                <h2>Eigene Besuche</h2>
                <p className="an-card-note">
                    Solange du als Admin angemeldet bist, werden deine Aufrufe serverseitig verworfen. Zusätzlich merkt sich jedes
                    Gerät, auf dem du den Admin-Bereich geöffnet hast, den Ausschluss — auch nach Logout.
                </p>
                <TrackingOptOutToggle />
            </section>

            {/* Datenverwaltung: Besucher-Analytics sichern / zurücksetzen */}
            <DataResetCard
                title="Besucher-Daten verwalten"
                description={`Betrifft alle Besucher-Auswertungen gemeinsam (Überblick, Zielgruppe, Verhalten, Herkunft, Ziele, Ereignisse) — ${formatNumber(eventsAllTime)} Ereignisse insgesamt. Lade bei Bedarf ein Backup herunter und setze die Daten für einen sauberen Neustart zurück. Das Bot-Log bleibt davon unberührt.`}
                count={eventsAllTime}
                backupHref="/api/admin/analytics-backup?scope=events"
                action={resetVisitorDataAction}
            />
        </div>
    );
}
