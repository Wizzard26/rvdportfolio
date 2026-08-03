import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import RadarCompanyForm from '@/components/analytics/RadarCompanyForm';
import { createCompanyAction } from '@/lib/content/radarActions';

export const dynamic = 'force-dynamic';

export default function NewRadarCompany() {
    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/radar" className="an-back"><FiArrowLeft aria-hidden="true" /> Zum Radar</Link>
                    <h1>Neue Firma</h1>
                </div>
            </div>
            <section className="an-card an-card-form">
                <RadarCompanyForm action={createCompanyAction} />
            </section>
        </div>
    );
}
