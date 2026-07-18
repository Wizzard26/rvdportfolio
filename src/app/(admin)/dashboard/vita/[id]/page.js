import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import StationForm from '@/components/analytics/StationForm';
import { getStation } from '@/lib/content/vitaStore';
import { updateStationAction } from '@/lib/content/vitaActions';

export const dynamic = 'force-dynamic';

export default async function EditStation({ params }) {
    const { id } = await params;
    const station = getStation(Number(id));
    if (!station) notFound();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/vita" className="an-back"><FiArrowLeft aria-hidden="true" /> Zur Übersicht</Link>
                    <h1>Station bearbeiten</h1>
                    <p>{station.title} · {station.company}</p>
                </div>
            </div>
            <section className="an-card an-card-form">
                <StationForm action={updateStationAction} station={station} />
            </section>
        </div>
    );
}
