import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import PrivateRefForm from '@/components/analytics/PrivateRefForm';
import PrivateRefImageManager from '@/components/analytics/PrivateRefImageManager';
import { updatePrivateRefAction } from '@/lib/content/privateRefsActions';
import { getPrivateRef } from '@/lib/content/privateRefsStore';

export const dynamic = 'force-dynamic';

export default async function EditPrivateRef({ params }) {
    const { id } = await params;
    const ref = getPrivateRef(Number(id));
    if (!ref) notFound();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/vertrauliche-referenzen" className="an-back"><FiArrowLeft aria-hidden="true" /> Zu den vertraulichen Referenzen</Link>
                    <h1>Vertrauliche Referenz bearbeiten</h1>
                </div>
            </div>
            <section className="an-card an-card-form">
                <PrivateRefForm action={updatePrivateRefAction} item={ref} />
            </section>
            <section className="an-card">
                <h2 className="an-catgroup-title">Screenshots</h2>
                <PrivateRefImageManager refId={ref.id} images={ref.images} />
            </section>
        </div>
    );
}
