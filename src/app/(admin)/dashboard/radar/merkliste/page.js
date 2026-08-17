import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { getMerkliste } from '@/lib/content/radarStore';
import { formatNumber } from '@/lib/analytics/format';
import MerklisteBoard from '@/components/analytics/MerklisteBoard';

export const dynamic = 'force-dynamic';

export default async function RadarMerklistePage() {
    const companies = getMerkliste();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/radar" className="an-back"><FiArrowLeft aria-hidden="true" /> Zum Radar</Link>
                    <h1>Merkliste</h1>
                    <p>Kuratierte Bewerbungs-Reihenfolge · {formatNumber(companies.length)} {companies.length === 1 ? 'Firma' : 'Firmen'} · per Ziehgriff sortieren</p>
                </div>
            </div>

            <section className="an-card an-full">
                <p className="an-card-note" style={{ marginTop: 0 }}>
                    Ziehe die Einträge in die Reihenfolge, in der du dich bewerben möchtest (oben zuerst). „Öffnen"
                    führt zur Firma, wo du eine Chance anlegen und eine Freigabe erzeugen kannst.
                </p>
                <MerklisteBoard companies={companies} />
            </section>
        </div>
    );
}
