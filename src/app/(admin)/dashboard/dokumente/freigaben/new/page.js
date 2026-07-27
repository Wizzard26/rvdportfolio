import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import ShareForm from '@/components/analytics/ShareForm';
import { createShareAction } from '@/lib/content/sharesActions';
import { getDocuments } from '@/lib/content/documentsStore';
import { getActiveTestimonials } from '@/lib/content/testimonialsStore';

export const dynamic = 'force-dynamic';

export default function NewShare() {
    const documents = getDocuments();
    const testimonials = getActiveTestimonials();
    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/dokumente/freigaben" className="an-back"><FiArrowLeft aria-hidden="true" /> Zu den Freigaben</Link>
                    <h1>Neue Freigabe</h1>
                </div>
            </div>
            <section className="an-card an-card-form">
                <ShareForm action={createShareAction} documents={documents} testimonials={testimonials} />
            </section>
        </div>
    );
}
