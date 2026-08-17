import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiShare2 } from 'react-icons/fi';
import { getSharesPage, countShares } from '@/lib/content/sharesStore';
import { deleteShareAction, toggleShareAction } from '@/lib/content/sharesActions';
import StatusToggle from '@/components/analytics/StatusToggle';
import ShareLink from '@/components/analytics/ShareLink';

export const dynamic = 'force-dynamic';

const TABS = [
    { key: 'aktiv', label: 'Aktiv' },
    { key: 'inaktiv', label: 'Inaktiv' },
];
const PAGE_SIZE = 25;

export default async function FreigabenAdmin({ searchParams }) {
    const sp = await searchParams;
    const tab = TABS.find((t) => t.key === sp?.tab)?.key || 'aktiv';
    const counts = { aktiv: countShares('aktiv'), inaktiv: countShares('inaktiv') };
    const total = counts[tab];
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(pages, Math.max(1, parseInt(sp?.page, 10) || 1));
    const shares = getSharesPage({ tab, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });

    const qs = (over = {}) => {
        const o = { tab, page, ...over };
        const parts = Object.entries(o)
            .filter(([k, v]) => v != null && !(k === 'page' && Number(v) <= 1))
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
        return parts.length ? `?${parts.join('&')}` : '?';
    };

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Freigaben</h1>
                    <p>Dokument-Sammlungen mit geheimem Link (z. B. Bewerbungen) · {counts.aktiv} aktiv, {counts.inaktiv} inaktiv</p>
                </div>
                <Link href="/dashboard/dokumente/freigaben/new" className="an-btn-primary">
                    <FiPlus aria-hidden="true" /> Neue Freigabe
                </Link>
            </div>

            <div className="an-tabs">
                {TABS.map((t) => (
                    <Link key={t.key} href={qs({ tab: t.key, page: 1 })} className={`an-tab${t.key === tab ? ' is-active' : ''}`}>
                        {t.label} <span className="an-muted" style={{ fontSize: '0.85em' }}>({counts[t.key]})</span>
                    </Link>
                ))}
            </div>

            <section className="an-card">
                {shares.length === 0 ? (
                    <p className="an-empty">{tab === 'aktiv' ? 'Keine aktiven Freigaben.' : 'Keine inaktiven Freigaben.'}</p>
                ) : (
                    <ul className="an-stationlist">
                        {shares.map((s) => {
                            const expired = !!(s.expires_at && s.expires_at < new Date().toISOString().slice(0, 10));
                            return (
                                <li key={s.id} className="an-station">
                                    <span className="an-media-badge" title="Freigabe"><FiShare2 aria-hidden="true" /></span>
                                    <div className="an-station-main">
                                        <div className="an-station-title">
                                            {s.title || '(ohne Titel)'}
                                            <span className="an-badge">{s.item_count} Dok.</span>
                                            {s.access_code && <span className="an-badge" title="PLZ-Gate aktiv">🔒 Code</span>}
                                            {!s.is_active && <span className="an-badge an-badge--bad" title="Deaktiviert">aus</span>}
                                            {expired && <span className="an-badge an-badge--warn" title={`Abgelaufen am ${s.expires_at}`}>abgelaufen</span>}
                                        </div>
                                        {s.company && <div className="an-station-sub">{s.company}</div>}
                                        <ShareLink path={`/freigabe/${s.token}`} />
                                    </div>
                                    <div className="an-station-actions">
                                        <StatusToggle action={toggleShareAction} id={s.id} active={!!s.is_active} />
                                        <Link href={`/dashboard/dokumente/freigaben/${s.id}`} className="an-icon-btn" title="Bearbeiten"><FiEdit2 /></Link>
                                        <form action={deleteShareAction} className="an-inline-form">
                                            <input type="hidden" name="id" value={s.id} />
                                            <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button>
                                        </form>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {pages > 1 && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
                        {page > 1 && <Link href={qs({ page: page - 1 })} className="an-btn-secondary an-btn-small">← Zurück</Link>}
                        <span className="an-muted" style={{ fontSize: '0.85em' }}>Seite {page} / {pages}</span>
                        {page < pages && <Link href={qs({ page: page + 1 })} className="an-btn-secondary an-btn-small">Weiter →</Link>}
                    </div>
                )}
            </section>
        </div>
    );
}
