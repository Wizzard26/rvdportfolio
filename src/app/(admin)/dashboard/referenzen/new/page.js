import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import TestimonialForm from '@/components/analytics/TestimonialForm';
import { createTestimonialAction } from '@/lib/content/testimonialsActions';

export const dynamic = 'force-dynamic';

export default function NewTestimonial() {
    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/referenzen" className="an-back"><FiArrowLeft aria-hidden="true" /> Zu den Referenzen</Link>
                    <h1>Neue Referenz</h1>
                </div>
            </div>
            <section className="an-card an-card-form">
                <TestimonialForm action={createTestimonialAction} />
            </section>
        </div>
    );
}
