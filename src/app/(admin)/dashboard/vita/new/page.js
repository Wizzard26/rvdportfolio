import { requireAdminPage } from '@/lib/adminAuth';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import StationForm from '@/components/analytics/StationForm';
import { createStationAction } from '@/lib/content/vitaActions';

export const dynamic = 'force-dynamic';

export default async function NewStation() {
    await requireAdminPage();
    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/vita" className="an-back"><FiArrowLeft aria-hidden="true" /> Zur Übersicht</Link>
                    <h1>Neue Station</h1>
                </div>
            </div>
            <section className="an-card an-card-form">
                <StationForm action={createStationAction} />
            </section>
        </div>
    );
}
