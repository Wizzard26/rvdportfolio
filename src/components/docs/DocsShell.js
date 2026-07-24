import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import DocsNav from './DocsNav';
import DocsToc from './DocsToc';
import styles from './docs.module.css';

// Gemeinsame GitBook-artige Hülle EINES Doku-Bereichs: Kopf mit Bereichsname +
// „alle Dokus", linke Baum-Sidebar, Inhalt, rechtes Inhaltsverzeichnis, Prev/Next.
// `space` = aktueller Bereich (name/slug). Genutzt von /docs/[space] (Index) und
// /docs/[space]/[slug] (Einzelseite).
export default function DocsShell({ space, tree, activeSlug = null, headings = [], prev, next, children }) {
    const href = (slug) => `/docs/${space.slug}/${slug}`;
    return (
        <main className="main-content">
            <section>
                <div className="content-inner">
                    <div className={styles.shell}>
                        <aside className={styles.sidebar}>
                            <div className={styles.spaceHead}>
                                <Link href="/docs" className={styles.spaceBack}>
                                    <FiArrowLeft aria-hidden="true" /> Alle Dokus
                                </Link>
                                <Link href={`/docs/${space.slug}`} className={styles.spaceName}>{space.name}</Link>
                            </div>
                            <DocsNav tree={tree} spaceSlug={space.slug} activeSlug={activeSlug} />
                        </aside>

                        <article className={styles.article}>
                            {children}

                            {(prev || next) && (
                                <nav className={styles.prevnext} aria-label="Seitennavigation">
                                    {prev ? (
                                        <Link href={href(prev.slug)} className={styles.prevnextLink}>
                                            <span className={styles.prevnextDir}>← Zurück</span>
                                            <span className={styles.prevnextTitle}>{prev.title}</span>
                                        </Link>
                                    ) : <span />}
                                    {next ? (
                                        <Link href={href(next.slug)} className={`${styles.prevnextLink} ${styles.prevnextRight}`}>
                                            <span className={styles.prevnextDir}>Weiter →</span>
                                            <span className={styles.prevnextTitle}>{next.title}</span>
                                        </Link>
                                    ) : <span />}
                                </nav>
                            )}
                        </article>

                        <DocsToc headings={headings} />
                    </div>
                </div>
            </section>
        </main>
    );
}
