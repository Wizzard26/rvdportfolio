import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import { getTestimonials, SHOWCASE_KEY, ABOUT_KEY, SHOPWARE_KEY } from '@/lib/content/testimonialsStore';
import { getSetting } from '@/lib/content/settingsStore';
import { setTestimonialPlacementAction } from '@/lib/content/testimonialsActions';
import TestimonialList from '@/components/analytics/TestimonialList';

export const dynamic = 'force-dynamic';

export default async function TestimonialsAdmin() {
    const testimonials = getTestimonials();
    const showShowcase = getSetting(SHOWCASE_KEY) === '1';
    const showAbout = getSetting(ABOUT_KEY) === '1';
    const showShopware = getSetting(SHOPWARE_KEY) === '1';
    const activeCount = testimonials.filter((t) => t.is_active).length;

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Referenzen &amp; Stimmen</h1>
                    <p>Social Proof für Bewerbungen · {testimonials.length} gesamt, {activeCount} aktiv</p>
                </div>
                <Link href="/dashboard/referenzen/new" className="an-btn-primary">
                    <FiPlus aria-hidden="true" /> Neue Referenz
                </Link>
            </div>

            <section className="an-card">
                <h2 className="an-catgroup-title">Wo anzeigen?</h2>
                <form action={setTestimonialPlacementAction} className="an-form">
                    <label className="an-check">
                        <input type="checkbox" name="show_showcase" defaultChecked={showShowcase} />
                        <span>Auf der <strong>Showcase</strong>-Seite anzeigen</span>
                    </label>
                    <label className="an-check">
                        <input type="checkbox" name="show_about" defaultChecked={showAbout} />
                        <span>Auf der <strong>Über-mich</strong>-Seite anzeigen</span>
                    </label>
                    <label className="an-check">
                        <input type="checkbox" name="show_shopware" defaultChecked={showShopware} />
                        <span>Auf der <strong>Shopware-Entwickler</strong>-Landingpage anzeigen</span>
                    </label>
                    <span className="an-card-note">Auf einzelnen Freigabe-Seiten schaltest du die Stimmen pro Freigabe ein/aus.
                        Angezeigt werden immer nur <em>aktive</em> Referenzen.</span>
                    <div className="an-form-actions">
                        <button type="submit" className="an-btn-primary">Übernehmen</button>
                    </div>
                </form>
            </section>

            <section className="an-card">
                <TestimonialList testimonials={testimonials} />
            </section>
        </div>
    );
}
