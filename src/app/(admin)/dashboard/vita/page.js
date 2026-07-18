import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import { getStations } from '@/lib/content/vitaStore';
import VitaStationList from '@/components/analytics/VitaStationList';

export const dynamic = 'force-dynamic';

export default async function VitaAdmin() {
    const stations = getStations();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Vita verwalten</h1>
                    <p>Stationen anlegen, bearbeiten und per Drag &amp; Drop sortieren · {stations.length} Einträge</p>
                </div>
                <Link href="/dashboard/vita/new" className="an-btn-primary">
                    <FiPlus aria-hidden="true" /> Neue Station
                </Link>
            </div>

            <section className="an-card">
                <VitaStationList stations={stations} />
            </section>
        </div>
    );
}
