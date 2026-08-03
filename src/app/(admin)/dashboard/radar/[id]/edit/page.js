import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import RadarCompanyForm from '@/components/analytics/RadarCompanyForm';
import { updateCompanyAction } from '@/lib/content/radarActions';
import { getCompany } from '@/lib/content/radarStore';

export const dynamic = 'force-dynamic';

export default async function EditRadarCompany({ params }) {
    const { id } = await params;
    const company = getCompany(Number(id));
    if (!company) notFound();
    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href={`/dashboard/radar/${company.id}`} className="an-back"><FiArrowLeft aria-hidden="true" /> Zur Firma</Link>
                    <h1>Firma bearbeiten</h1>
                </div>
            </div>
            <section className="an-card an-card-form">
                <RadarCompanyForm action={updateCompanyAction} company={company} />
            </section>
        </div>
    );
}
