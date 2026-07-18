import HeroContent from "@/components/herocontent/page";
import ShowcaseClient from "@/components/showcases/ShowcaseClient";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, pageMetadata, showcaseSchema, siteConfig } from "@/lib/seo";
import { getProjects } from "@/lib/content/showcaseStore";
import { getGalleryItems } from "@/lib/content/galleryStore";

export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
    title: 'Showcase – Referenzen & Case Studys',
    description:
        'Ausgewählte Arbeiten von René van Dinter: Shopware-6-Plugins und Case Studys, React- und Next.js-Anwendungen, JavaScript-Demos sowie Layouts und Printdesign.',
    path: '/showcase',
});

// CollectionPage: markiert die Seite als kuratierte Sammlung von Arbeiten —
// die Form, in der Suchmaschinen und LLMs "zeig mir Referenzen von X"
// beantworten.
const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteConfig.url}/showcase/#collectionpage`,
    url: `${siteConfig.url}/showcase`,
    name: 'Showcase – Referenzen & Case Studys',
    description:
        'Ausgewählte Arbeiten aus Shopware-6-Entwicklung, React/Next.js, JavaScript sowie Grafik- und Webdesign.',
    inLanguage: siteConfig.lang,
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    about: { '@id': `${siteConfig.url}/#person` },
    creator: { '@id': `${siteConfig.url}/#person` },
};

export default function ShowCase() {
    const pageName = "Showcase";
    const projects = getProjects();
    const shopwareProjects = projects.filter((p) => p.category === 'shopware');
    const reactProjects = projects.filter((p) => p.category === 'react');
    const galleryItems = getGalleryItems();

    return(
        <>
            <JsonLd data={[
                collectionSchema,
                showcaseSchema(projects),
                breadcrumbSchema([{ name: 'Showcase', path: '/showcase' }]),
            ]} />
            <HeroContent
                className={`hero-container`}
                pageName={pageName}
                imgPos="top"
                txtPos="right"
            />
            <ShowcaseClient
                shopwareProjects={shopwareProjects}
                reactProjects={reactProjects}
                galleryItems={galleryItems}
            />
        </>
    )
}
