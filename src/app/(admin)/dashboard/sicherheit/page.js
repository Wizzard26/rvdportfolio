import { FiDownload } from 'react-icons/fi';
import {
    getLoginEvents, countLoginEvents, getSecurityStats, FAIL_LIMIT, FAIL_WINDOW_MS,
    getSuspiciousHits, countSuspiciousHits, getSuspiciousStats,
} from '@/lib/analytics/securityStore';
import { formatNumber } from '@/lib/analytics/format';
import { formatBerlinDateTime } from '@/lib/dateFormat';
import StatTile from '@/components/analytics/StatTile';
import PagerLinks from '@/components/analytics/PagerLinks';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

const OUTCOME = {
    success: { label: 'Erfolgreich', cls: 'ok' },
    fail: { label: 'Fehlgeschlagen', cls: 'bad' },
    blocked: { label: 'Blockiert', cls: 'warn' },
};

export default async function SecurityPage({ searchParams }) {
    const params = await searchParams;
    const page = Math.max(1, Number(params?.p) || 1);
    const suspPage = Math.max(1, Number(params?.sp) || 1);

    const { lastSuccess, fails24, success24, total, blockedNow } = getSecurityStats();
    const eventCount = countLoginEvents();
    const totalPages = Math.max(1, Math.ceil(eventCount / PAGE_SIZE));
    const events = getLoginEvents({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
    const windowMin = Math.round(FAIL_WINDOW_MS / 60000);

    // Verdächtige Scanner-Zugriffe (aus dem Bot-Log).
    const { last24: suspLast24, topPaths, exposedPaths } = getSuspiciousStats();
    const suspCount = countSuspiciousHits();
    const suspPages = Math.max(1, Math.ceil(suspCount / PAGE_SIZE));
    const suspicious = getSuspiciousHits({ limit: PAGE_SIZE, offset: (suspPage - 1) * PAGE_SIZE });

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Sicherheit</h1>
                    <p>Admin-Login-Protokoll & Brute-Force-Schutz</p>
                </div>
                <a className="an-btn-secondary" href="/api/admin/security-export" download>
                    <FiDownload aria-hidden="true" /> CSV-Export
                </a>
            </div>

            <p className="an-card-note">
                Jeder Login-Versuch wird anonymisiert protokolliert (IP nur als Hash, kein Klartext). Nach{' '}
                <strong>{FAIL_LIMIT} Fehlversuchen</strong> je IP innerhalb von <strong>{windowMin} Minuten</strong>{' '}
                wird die IP vorübergehend gesperrt. Prüfe hier regelmäßig, ob es unerwartete erfolgreiche Logins
                oder auffällig viele Fehlversuche gab.
            </p>

            <div className="an-tiles">
                <StatTile
                    value={lastSuccess ? formatBerlinDateTime(lastSuccess.ts) : '—'}
                    label="Letzter erfolgreicher Login"
                    hint={lastSuccess ? [lastSuccess.country, lastSuccess.browser].filter(Boolean).join(' · ') : 'noch keiner'}
                />
                <StatTile value={formatNumber(fails24)} label="Fehlversuche (24 h)" hint={fails24 > 0 ? 'prüfen' : 'unauffällig'} />
                <StatTile value={formatNumber(blockedNow)} label="Aktuell gesperrte IPs" hint={`über ${FAIL_LIMIT} Fehlversuche`} />
                <StatTile value={formatNumber(success24)} label="Erfolgreiche Logins (24 h)" hint={`${formatNumber(total)} Ereignisse gesamt`} />
            </div>

            <section className="an-card an-full" id="login-verlauf">
                <h2>Login-Verlauf{eventCount ? ` · ${formatNumber(eventCount)}` : ''}</h2>
                {events.length === 0 ? (
                    <p className="an-card-note">Noch keine Login-Ereignisse protokolliert.</p>
                ) : (
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Zeit</th><th>Ergebnis</th><th>Land</th><th>Browser</th><th>OS</th></tr></thead>
                            <tbody>
                                {events.map((e, i) => {
                                    const o = OUTCOME[e.outcome] || { label: e.outcome, cls: '' };
                                    return (
                                        <tr key={`${e.ts}-${i}`}>
                                            <td>{formatBerlinDateTime(e.ts, { withSeconds: true })}</td>
                                            <td><span className={`an-badge an-badge--${o.cls}`}>{o.label}</span></td>
                                            <td>{e.country || '—'}</td>
                                            <td>{e.browser || '—'}</td>
                                            <td>{e.os || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <PagerLinks basePath="/dashboard/sicherheit" param="p" page={page} totalPages={totalPages}
                    params={{ sp: suspPage > 1 ? suspPage : undefined }} anchor="#login-verlauf" />
            </section>

            <section className="an-card an-full" id="verdaechtige-zugriffe">
                <h2>Verdächtige Zugriffe{suspCount ? ` · ${formatNumber(suspCount)}` : ''}</h2>
                <p className="an-card-note">
                    Automatische Schwachstellen-Scans aus dem Bot-Log – Zugriffe auf typische Angriffs-Pfade
                    (<code>.env</code>, <code>wp-config</code>, <code>.git</code>, Datenbank-Dumps …). Diese Pfade
                    existieren hier nicht, alle laufen ins Leere (404). Zur Nachverfolgung; kein Handlungsbedarf,
                    solange es 404s bleiben. · <strong>{formatNumber(suspLast24)}</strong> in den letzten 24 h.
                </p>

                {exposedPaths.length > 0 && (
                    <p className="an-alert-danger">
                        ⚠ <strong>Achtung:</strong> {exposedPaths.length} angefragte{exposedPaths.length === 1 ? 'r Pfad existiert' : ' Pfade existieren'} tatsächlich
                        auf dem Server – also potenziell erreichbar (kein 404). Bitte prüfen: {exposedPaths.slice(0, 6).map((p, i) => (
                            <span key={p}>{i > 0 ? ', ' : ''}<code>{p}</code></span>
                        ))}
                    </p>
                )}

                {topPaths.length > 0 && (
                    <div className="an-table-wrap" style={{ marginBottom: 16 }}>
                        <table className="an-table">
                            <thead><tr><th>Häufigste angefragte Angriffs-Pfade</th><th>Anfragen</th></tr></thead>
                            <tbody>
                                {topPaths.map((p) => (
                                    <tr key={p.path}><td>{p.path}</td><td>{formatNumber(p.n)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {suspicious.length === 0 ? (
                    <p className="an-card-note">Keine verdächtigen Zugriffe protokolliert.</p>
                ) : (
                    <div className="an-table-wrap">
                        <table className="an-table">
                            <thead><tr><th>Zeit</th><th>Pfad</th><th>Status</th><th>Quelle</th></tr></thead>
                            <tbody>
                                {suspicious.map((h, i) => (
                                    <tr key={`${h.ts}-${i}`}>
                                        <td>{formatBerlinDateTime(h.ts, { withSeconds: true })}</td>
                                        <td>{h.path}</td>
                                        <td>
                                            {h.served
                                                ? <span className="an-badge an-badge--bad" title="Datei existiert auf dem Server – potenziell erreichbar">⚠ erreichbar</span>
                                                : <span className="an-badge" title="Pfad existiert nicht – Zugriff läuft ins Leere">404</span>}
                                        </td>
                                        <td>{h.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <PagerLinks basePath="/dashboard/sicherheit" param="sp" page={suspPage} totalPages={suspPages}
                    params={{ p: page > 1 ? page : undefined }} anchor="#verdaechtige-zugriffe" />
            </section>
        </div>
    );
}
