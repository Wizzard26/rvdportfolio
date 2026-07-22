import Link from 'next/link';
import { FiEdit2, FiEye, FiDownload, FiClock, FiExternalLink } from 'react-icons/fi';
import { getApplications, getApplicationStats } from '@/lib/content/sharesStore';
import { STATUS_LABELS, STATUS_TONE } from '@/lib/applicationStatus';
import StatTile from '@/components/analytics/StatTile';

export const dynamic = 'force-dynamic';

const NACHFASS_TAGE = 14;

function today() { return new Date().toISOString().slice(0, 10); }
function fmtDate(iso) {
    if (!iso) return null;
    const [y, m, d] = iso.slice(0, 10).split('-');
    return d && m && y ? `${d}.${m}.${y}` : iso;
}
function fmtTs(ts) { return ts ? fmtDate(new Date(ts).toISOString()) : null; }
function daysSince(iso) {
    if (!iso) return null;
    return Math.floor((new Date(today()) - new Date(iso.slice(0, 10))) / 86400000);
}

// Status-Badge inkl. Sonderfälle geschlossen/abgelaufen.
function badge(app) {
    if (app.expired) return { label: 'Abgelaufen', tone: 'offen' };
    if (!app.is_active) return { label: 'Geschlossen', tone: 'offen' };
    return { label: STATUS_LABELS[app.status] || STATUS_LABELS.offen, tone: STATUS_TONE[app.status] || 'offen' };
}

// Ist bei laufenden Bewerbungen ein Nachfassen fällig?
function nachfass(app) {
    if (!app.running) return null;
    if (app.followup_at && app.followup_at <= today()) return 'Wiedervorlage fällig';
    if ((app.status || 'offen') === 'offen') {
        const d = daysSince(app.sent_at || null);
        if (d != null && d >= NACHFASS_TAGE) return `seit ${d} Tagen ohne Antwort`;
    }
    return null;
}

function Signal({ app }) {
    if (!app.view_count) return <span className="an-muted">noch nicht aufgerufen</span>;
    return (
        <span className="an-app-signal">
            <FiEye aria-hidden="true" /> {app.view_count}× (zuletzt {fmtTs(app.last_view)})
            {app.download_count ? <> · <FiDownload aria-hidden="true" /> {app.download_count}×</> : null}
        </span>
    );
}

function Row({ app }) {
    const b = badge(app);
    const nf = nachfass(app);
    return (
        <li className={`an-station${nf ? ' an-app-overdue' : ''}`}>
            <div className="an-station-main">
                <div className="an-station-title">
                    {app.company || app.title || '(ohne Firma)'}
                    <span className={`an-appstatus an-appstatus--${b.tone}`}>{b.label}</span>
                    {nf && <span className="an-nachfass"><FiClock aria-hidden="true" /> {nf}</span>}
                </div>
                <div className="an-station-sub">
                    {app.position && <>{app.position} · </>}
                    {app.sent_at ? <>zugestellt {fmtDate(app.sent_at)}</> : <span className="an-muted">noch nicht zugestellt</span>}
                    {app.status === 'gespraech' && app.interview_at && <> · Gespräch {fmtDate(app.interview_at)} {app.interview_at.slice(11, 16)} Uhr</>}
                    {app.decision_date && (app.status === 'zusage' || app.status === 'absage') && <> · Entscheidung {fmtDate(app.decision_date)}</>}
                    {' · '}<Signal app={app} />
                </div>
            </div>
            <div className="an-station-actions">
                <a href={`/freigabe/${app.token}`} target="_blank" rel="noreferrer" className="an-icon-btn" title="Freigabe öffnen"><FiExternalLink /></a>
                <Link href={`/dashboard/dokumente/freigaben/${app.id}`} className="an-icon-btn" title="Bearbeiten"><FiEdit2 /></Link>
            </div>
        </li>
    );
}

export default async function ApplicationsAdmin() {
    const apps = getApplications();
    const stats = getApplicationStats();
    const laufend = apps.filter((a) => a.running)
        .sort((a, b) => (nachfass(b) ? 1 : 0) - (nachfass(a) ? 1 : 0)); // Nachfass-Fälle oben
    const abgeschlossen = apps.filter((a) => !a.running);

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Bewerbungen</h1>
                    <p>Übersicht über laufende und abgeschlossene Bewerbungsprozesse</p>
                </div>
            </div>

            <div className="an-tiles">
                <StatTile label="Laufend" value={stats.laufend} hint={`${stats.total} gesamt`} />
                <StatTile label="Zusagen" value={stats.zusagen} />
                <StatTile label="Absagen" value={stats.absagen} />
                <StatTile label="Rücklaufquote" value={`${stats.responseRate}%`}
                          hint={stats.avgResponseDays != null ? `ø Antwort in ${stats.avgResponseDays} Tagen` : 'Antworten / gesamt'} />
            </div>

            <section className="an-card">
                <h2 className="an-catgroup-title">Laufend <span className="an-muted">· {laufend.length}</span></h2>
                {laufend.length === 0 ? <p className="an-empty">Keine laufenden Bewerbungen</p> : (
                    <ul className="an-stationlist">{laufend.map((a) => <Row key={a.id} app={a} />)}</ul>
                )}
            </section>

            <section className="an-card">
                <h2 className="an-catgroup-title">Abgeschlossen <span className="an-muted">· {abgeschlossen.length}</span></h2>
                {abgeschlossen.length === 0 ? <p className="an-empty">Noch nichts abgeschlossen</p> : (
                    <ul className="an-stationlist">{abgeschlossen.map((a) => <Row key={a.id} app={a} />)}</ul>
                )}
            </section>

            <p className="an-card-note">Bewerbungen entstehen aus den Freigaben mit Anlass „Bewerbung" oder „Initiativbewerbung" (unter <Link href="/dashboard/dokumente/freigaben">Dokumente → Freigaben</Link>).</p>
        </div>
    );
}
