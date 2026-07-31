import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import { getPrivateRefs } from '@/lib/content/privateRefsStore';
import PrivateRefList from '@/components/analytics/PrivateRefList';

export const dynamic = 'force-dynamic';

export default async function PrivateRefsAdmin() {
    const refs = getPrivateRefs();
    const activeCount = refs.filter((r) => r.is_active).length;

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Vertrauliche Referenzen</h1>
                    <p>Arbeitsproben nur für private Freigaben · {refs.length} gesamt, {activeCount} aktiv</p>
                </div>
                <Link href="/dashboard/vertrauliche-referenzen/new" className="an-btn-primary">
                    <FiPlus aria-hidden="true" /> Neue Referenz
                </Link>
            </div>

            <p className="an-card-note">
                Diese Referenzen erscheinen <strong>ausschließlich</strong> auf den privaten Freigabe-Seiten
                (<code>/freigabe/…</code>, nicht indexiert), die du gezielt teilst – nie im öffentlichen Showcase.
                Gedacht für Arbeiten, an denen du Rechte am Produkt (nicht am Code) hast oder die noch nicht
                öffentlich angekündigt sind. Zuordnung erfolgt pro Freigabe.
            </p>

            <section className="an-card">
                <PrivateRefList refs={refs} />
            </section>
        </div>
    );
}
