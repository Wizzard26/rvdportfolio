import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { roboto } from "@/app/fonts";
import Button from "@/components/button/Button";
import BlogArticle from "@/components/blog/BlogArticle";
import { getPosts, getDocsBySpace } from "@/lib/content/postsStore";
import { getSpaces } from "@/lib/content/docSpacesStore";
import styles from "./knowledge.module.css";

// „Fachwissen & Einblicke" auf der Startseite: Beleg der Kompetenz statt bloßer
// Behauptung — die 2 neuesten Blog-Beiträge plus ein Einstieg in die Dokus
// (Wissensdatenbank). Bewusst weit unten platziert, damit der Haupt-CTA
// (Verfügbarkeit/Kontakt) die Bühne behält. Server-Component: liest content.db.
export default function KnowledgeSection() {
    const posts = getPosts({ type: 'blog', publicOnly: true }).slice(0, 2);
    const spaces = getSpaces({ publicOnly: true })
        .map((s) => ({ ...s, pages: getDocsBySpace(s.id, { publicOnly: true }).length }))
        .filter((s) => s.pages > 0);

    // Ohne Inhalte gar nicht erst rendern (z. B. frische DB ohne aktive Beiträge).
    if (posts.length === 0 && spaces.length === 0) return null;

    return (
        <section className="secondary--bg">
            <div className="content-inner">
                <h2 className={`${roboto.className} is--centered`}>Fachwissen &amp; Einblicke</h2>
                <p className="is--centered" style={{ maxWidth: '820px', margin: '0 auto 36px' }}>
                    Im <strong>Blog</strong> teile ich Gedanken zu Shopware, Webentwicklung und E-Commerce,
                    in den <strong>Dokus</strong> fasse ich mein Wissen strukturiert zusammen –
                    ein Einblick in meine Arbeitsweise.
                </p>

                <div className="row">
                    {/* Blog: die zwei neuesten Beiträge */}
                    {posts.length > 0 && (
                        <div className="col-12 col-lg-8">
                            <div className="row">
                                {posts.map((post, i) => (
                                    <BlogArticle
                                        key={post.id}
                                        blogEntry={post}
                                        button={true}
                                        articleCols="col-12 col-md-6"
                                        index={i + 1}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dokus: Wissensdatenbank als Index */}
                    {spaces.length > 0 && (
                        <div className="col-12 col-lg-4">
                            <aside className={styles.dokusPanel}>
                                <h3 className={`${roboto.className} ${styles.dokusTitle}`}>Wissensdatenbank</h3>
                                <p className={styles.dokusLead}>
                                    Strukturierte Dokumentationen zu Technologien, mit denen ich arbeite –
                                    {' '}{spaces.length} Bereiche:
                                </p>
                                <ul className={styles.dokusList}>
                                    {spaces.map((s) => (
                                        <li key={s.id}>
                                            <Link href={`/docs/${s.slug}`} className={styles.dokusLink}>
                                                <FiArrowRight aria-hidden="true" />
                                                <span>{s.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </aside>
                        </div>
                    )}
                </div>

                {/* Absprung-CTAs */}
                <div className={styles.actions}>
                    {posts.length > 0 && (
                        <Button href="/blog" title="Alle Blog-Beiträge lesen" style="primary" text="Alle Beiträge" />
                    )}
                    {spaces.length > 0 && (
                        <Button href="/docs" title="Zu den Dokumentationen" style="secondary" text="Zu den Dokus" />
                    )}
                </div>
            </div>
        </section>
    );
}
