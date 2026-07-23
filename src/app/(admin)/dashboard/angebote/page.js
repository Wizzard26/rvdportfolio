import Link from 'next/link';
import { FiEdit2, FiTrash2, FiStar } from 'react-icons/fi';
import { getOffers, getOfferStats } from '@/lib/content/offersStore';
import { OFFER_STATUS_LABELS, OFFER_STATUS_TONE } from '@/lib/offerContent';
import { deleteOfferAction } from '@/lib/content/offersActions';
import StatTile from '@/components/analytics/StatTile';

export const dynamic = 'force-dynamic';

function fmtDate(ts) {
    return ts ? new Date(ts).toLocaleDateString('de-DE') : '';
}
function fmtSalary(o) {
    if (!o.salary_min && !o.salary_max) return null;
    const e = (n) => Number(n).toLocaleString('de-DE');
    return `${e(o.salary_min)}–${e(o.salary_max)} €`;
}

function Row({ o }) {
    const tone = OFFER_STATUS_TONE[o.status] || 'offen';
    const bits = [o.position, fmtSalary(o), o.model].filter(Boolean);
    return (
        <li className="an-station">
            <div className="an-station-main">
                <div className="an-station-title">
                    {o.company || '(ohne Firma)'}
                    <span className={`an-appstatus an-appstatus--${tone}`}>{OFFER_STATUS_LABELS[o.status] || o.status}</span>
                    {!o.viewed_at && <span className="an-appstatus an-appstatus--info">neu</span>}
                    {o.rated_at > 0 && <span className="an-nachfass"><FiStar aria-hidden="true" /> bewertet</span>}
                </div>
                <div className="an-station-sub">
                    {bits.length > 0 && <>{bits.join(' · ')} · </>}eingegangen {fmtDate(o.created_at)}
                </div>
            </div>
            <div className="an-station-actions">
                <Link href={`/dashboard/angebote/${o.id}`} className="an-icon-btn" title="Öffnen"><FiEdit2 /></Link>
                <form action={deleteOfferAction}>
                    <input type="hidden" name="id" value={o.id} />
                    <button type="submit" className="an-icon-btn" title="Löschen"><FiTrash2 /></button>
                </form>
            </div>
        </li>
    );
}

function Group({ title, items }) {
    return (
        <section className="an-card">
            <h2 className="an-catgroup-title">{title} <span className="an-muted">· {items.length}</span></h2>
            {items.length === 0 ? <p className="an-empty">Nichts hier</p> : (
                <ul className="an-stationlist">{items.map((o) => <Row key={o.id} o={o} />)}</ul>
            )}
        </section>
    );
}

export default async function OffersAdmin() {
    const offers = getOffers();
    const stats = getOfferStats();
    const neu = offers.filter((o) => o.status === 'neu');
    const bearbeitung = offers.filter((o) => o.status === 'interessant' || o.status === 'im_gespraech');
    const abgeschlossen = offers.filter((o) => o.status === 'angenommen' || o.status === 'abgelehnt');

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Angebote</h1>
                    <p>Eingegangene Angebote von Arbeitgebern über die „umgekehrte Bewerbung"</p>
                </div>
            </div>

            <div className="an-tiles">
                <StatTile label="Gesamt" value={stats.total} />
                <StatTile label="Neu" value={stats.neu} />
                <StatTile label="In Bearbeitung" value={stats.laufend} />
                <StatTile label="Angenommen" value={stats.angenommen} />
            </div>

            <Group title="Neu" items={neu} />
            <Group title="In Bearbeitung" items={bearbeitung} />
            <Group title="Abgeschlossen" items={abgeschlossen} />

            <p className="an-card-note">Angebote entstehen über die öffentliche Seite <Link href="/angebot">„Ihr Angebot an mich"</Link>.</p>
        </div>
    );
}
