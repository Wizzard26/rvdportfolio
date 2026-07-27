import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import TestimonialForm from '@/components/analytics/TestimonialForm';
import { updateTestimonialAction } from '@/lib/content/testimonialsActions';
import { getTestimonial } from '@/lib/content/testimonialsStore';

export const dynamic = 'force-dynamic';

export default async function EditTestimonial({ params }) {
    const { id } = await params;
    const testimonial = getTestimonial(Number(id));
    if (!testimonial) notFound();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <Link href="/dashboard/referenzen" className="an-back"><FiArrowLeft aria-hidden="true" /> Zu den Referenzen</Link>
                    <h1>Referenz bearbeiten</h1>
                </div>
            </div>
            <section className="an-card an-card-form">
                <TestimonialForm action={updateTestimonialAction} testimonial={testimonial} />
            </section>
        </div>
    );
}
