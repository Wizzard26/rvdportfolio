import { blogEntries } from "@/lib/blog";
import Image from "next/image";
import styles from "./styles.module.css";
import { roboto, ranga } from "@/app/fonts";
import { notFound } from "next/navigation";
import BackButton from "@/components/blog/BackButton";
import { pageMetadata } from "@/lib/seo";

// Server-Component: nur so lassen sich pro Beitrag eigene Metadaten erzeugen.
// Die Interaktion (Zurück-Button) steckt in `BackButton`.

// Erzeugt die Beitragsseiten zur Build-Zeit statt erst beim Aufruf — die
// Beiträge stehen als statische Daten fest.
export function generateStaticParams() {
    return blogEntries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const entry = blogEntries.find((entry) => entry.slug === slug);

    if (!entry) {
        return pageMetadata({
            title: 'Beitrag nicht gefunden',
            description: 'Dieser Beitrag existiert nicht.',
            path: `/blog/${slug}`,
            noindex: true,
        });
    }

    // `noindex` wie in der Blog-Übersicht — siehe Begründung in
    // `blog/page.js`. Titel und Beschreibung stehen trotzdem korrekt hier,
    // damit beim Aktivieren des Blogs nur das noindex entfernt werden muss.
    return pageMetadata({
        title: entry.title,
        description: entry.teaser,
        path: `/blog/${entry.slug}`,
        noindex: true,
    });
}

export default async function Slug({ params }) {
    const { slug } = await params;
    const entry = blogEntries.find((entry) => entry.slug === slug);
    if (!entry) notFound();
    const { title, subline, image, teaser } = entry;

    return(
        <>
            <main className="main-content">
                <section>
                    <div className="content-inner">
                        <div className="blog-single-entry row">
                            <div className={`${styles.blogImage} col-lg-4`}>
                                <Image src={`/img/blog/${image ? image : 'no-image.jpg'}`} title={`${title}`} width={200} height={200} alt={`${title}`}  />
                            </div>
                            <div className="blog-headlines col-lg-8">
                                <h1 className={roboto.className}>{ title }</h1>
                                <h2 className={ranga.className}>{ subline }</h2>
                                <p>{ teaser }</p>
                            </div>
                        </div>
                        <BackButton className={`${styles.backBtn} btn btn--secondary-full`} />
                    </div>
                </section>
            </main>
        </>
    )
}
