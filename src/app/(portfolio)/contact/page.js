import Teaser from "@/components/teaser/page";
import HeroContent from "@/components/herocontent/page";
import styles from "./styles.module.css";
import ContactForm from "@/components/contact/ContactForm";
import ContactData from "@/components/contact/ContactData";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, pageMetadata, siteConfig } from "@/lib/seo";

export const metadata = pageMetadata({
    title: 'Kontakt aufnehmen',
    description:
        'Kontakt zu René van Dinter – Shopware- & Web-Developer aus Stade. Per Kontaktformular, E-Mail oder Telefon. Ich melde mich zeitnah zurück.',
    path: '/contact',
});

const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${siteConfig.url}/contact/#contactpage`,
    url: `${siteConfig.url}/contact`,
    name: 'Kontakt – René van Dinter',
    inLanguage: siteConfig.lang,
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    mainEntity: { '@id': `${siteConfig.url}/#person` },
};

export default function Contact() {
    const pageName = 'Contact';

    return(
        <>
            <JsonLd data={[contactSchema, breadcrumbSchema([{ name: 'Kontakt', path: '/contact' }])]} />
            <main className="main-content">
                <HeroContent
                    className="hero-container"
                    pageName={pageName}
                />
                <Teaser
                    className="main--teaser"
                    pageName={pageName}
                />
                <section className="secondary--bg">
                    <div className="content-inner">
                        <div className={'row'}>
                            <div className={'col-12 col-lg-3'}>
                                <ContactData />
                            </div>
                            <div className={'col-12 col-lg-9'}>
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </>
    )
}