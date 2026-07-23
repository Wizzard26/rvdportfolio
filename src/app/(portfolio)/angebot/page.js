import HeroContent from '@/components/herocontent/page';
import Teaser from '@/components/teaser/page';
import OfferForm from '@/components/offer/OfferForm';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    title: 'Ihr Angebot an mich',
    description:
        'Bewerben Sie sich bei mir: Beantworten Sie einmal die Fragen, die sonst ich beantworten müsste – und machen Sie mir Ihr Angebot. Ein ehrlicher Perspektivwechsel auf Augenhöhe.',
    path: '/angebot',
});

export default function AngebotPage() {
    const pageName = 'Angebot';
    return (
        <>
            <JsonLd data={[breadcrumbSchema([{ name: 'Ihr Angebot an mich', path: '/angebot' }])]} />
            <main className="main-content">
                <HeroContent pageName={pageName} />
                <Teaser className="main--teaser" pageName={pageName} />
                <section className="secondary--bg">
                    <div className="content-inner">
                        <OfferForm />
                    </div>
                </section>
            </main>
        </>
    );
}
