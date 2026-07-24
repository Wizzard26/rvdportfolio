import Image from "next/image";
import styles from "./styles.module.css";
import { roboto, ranga } from "@/app/fonts";
import { notFound } from "next/navigation";
import BackButton from "@/components/blog/BackButton";
import Markdown from "@/components/blog/Markdown";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata, blogPostingSchema, breadcrumbSchema, ogImageUrl } from "@/lib/seo";
import { getPostBySlug } from "@/lib/content/postsStore";
import { toIsoDate, formatGermanDate } from "@/lib/dateFormat";

// Server-Component: eigene Metadaten pro Beitrag. Inhalte kommen aus content.db
// (admin-editierbar), daher dynamisch statt zur Build-Zeit statisch. Nur aktive
// Beiträge sind öffentlich sichtbar (Entwürfe → 404).
export const dynamic = 'force-dynamic';

// Bildpfad wie in der Übersicht: Uploads absolut (/media/…), Alt-Bilder unter
// /img/blog/, sonst Platzhalter.
function imageSrc(image) {
    if (!image) return '/img/blog/no-image.jpg';
    return image.startsWith('/') ? image : `/img/blog/${image}`;
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const entry = getPostBySlug('blog', slug);

    if (!entry) {
        return pageMetadata({
            title: 'Beitrag nicht gefunden',
            description: 'Dieser Beitrag existiert nicht.',
            path: `/blog/${slug}`,
            noindex: true,
        });
    }

    return pageMetadata({
        title: entry.title,
        description: entry.teaser,
        path: `/blog/${entry.slug}`,
        image: ogImageUrl(entry.title, 'Blog'),
    });
}

export default async function Slug({ params }) {
    const { slug } = await params;
    const entry = getPostBySlug('blog', slug);
    if (!entry || !entry.is_active) notFound();
    const { title, subline, image, teaser, body, author, published_at } = entry;
    const isoDate = toIsoDate(published_at);

    return(
        <>
            <JsonLd data={[
                blogPostingSchema(entry),
                breadcrumbSchema([
                    { name: 'Blog', path: '/blog' },
                    { name: title, path: `/blog/${entry.slug}` },
                ]),
            ]} />
            <main className="main-content">
                <section>
                    <div className="content-inner">
                        <div className="blog-single-entry row">
                            <div className={`${styles.blogImage} col-lg-4`}>
                                <Image src={imageSrc(image)} title={`${title}`} width={200} height={200} alt={`${title}`}  />
                            </div>
                            <div className="blog-headlines col-lg-8">
                                <h1 className={roboto.className}>{ title }</h1>
                                { subline && <h2 className={ranga.className}>{ subline }</h2> }
                                { (published_at || author) &&
                                    <p className={styles.blogMeta}>
                                        { isoDate
                                            ? <time dateTime={isoDate}>{formatGermanDate(published_at)}</time>
                                            : published_at }
                                        { published_at && author ? ' · ' : '' }
                                        { author }
                                    </p>
                                }
                                { teaser && <p>{ teaser }</p> }
                            </div>
                        </div>
                        { body && <hr className={styles.blogDivider} /> }
                        { body && <div className={styles.blogBody}><Markdown>{ body }</Markdown></div> }
                        <BackButton className={`${styles.backBtn} btn btn--secondary-full`} />
                    </div>
                </section>
            </main>
        </>
    )
}
