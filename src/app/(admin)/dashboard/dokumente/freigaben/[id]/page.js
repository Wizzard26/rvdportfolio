import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import ShareForm from '@/components/analytics/ShareForm';
import { updateShareAction } from '@/lib/content/sharesActions';
import { getShare } from '@/lib/content/sharesStore';
import { getDocuments } from '@/lib/content/documentsStore';
import ShareLink from '@/components/analytics/ShareLink';

export const dynamic = 'force-dynamic';

export default async function EditShare({ params }) {
    const { id } = await params;
    const share = getShare(Number(id));
    if (!share) notFound();
    const documents = getDocuments();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/dokumente/freigaben" className="an-back"><FiArrowLeft aria-hidden="true" /> Zu den Freigaben</Link>
                    <h1>Freigabe bearbeiten</h1>
                    <ShareLink path={`/freigabe/${share.token}`} />
                </div>
            </div>
            <section className="an-card an-card-form">
                <ShareForm action={updateShareAction} share={share} documents={documents} />
            </section>
        </div>
    );
}
