import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiShare2 } from 'react-icons/fi';
import { getShares } from '@/lib/content/sharesStore';
import { deleteShareAction, toggleShareAction } from '@/lib/content/sharesActions';
import DocumentsAdminTabs from '@/components/analytics/DocumentsAdminTabs';
import StatusToggle from '@/components/analytics/StatusToggle';
import ShareLink from '@/components/analytics/ShareLink';

export const dynamic = 'force-dynamic';

export default async function SharesAdmin() {
    const shares = getShares();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Freigaben</h1>
                    <p>Dokument-Sammlungen mit geheimem Link (z. B. Bewerbungen) · {shares.length} Freigaben</p>
                </div>
                <Link href="/dashboard/dokumente/freigaben/new" className="an-btn-primary">
                    <FiPlus aria-hidden="true" /> Neue Freigabe
                </Link>
            </div>

            <DocumentsAdminTabs active="shares" />

            <section className="an-card">
                {shares.length === 0 ? (
                    <p className="an-empty">Noch keine Freigaben</p>
                ) : (
                    <ul className="an-stationlist">
                        {shares.map((s) => (
                            <li key={s.id} className="an-station">
                                <span className="an-media-badge" title="Freigabe"><FiShare2 aria-hidden="true" /></span>
                                <div className="an-station-main">
                                    <div className="an-station-title">
                                        {s.title || '(ohne Titel)'}
                                        <span className="an-badge">{s.item_count} Dok.</span>
                                        {s.access_code && <span className="an-badge" title="PLZ-Gate aktiv">🔒 Code</span>}
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
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
