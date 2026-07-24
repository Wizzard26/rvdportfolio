import Link from 'next/link';
import styles from './docs.module.css';

// Sidebar-Baum EINES Doku-Bereichs: Gruppen (doc_group) → Seiten → Unterseiten
// (parent_id). Alle Links liegen unter /docs/<bereich>/… . `activeSlug` markiert
// die aktuelle Seite; da jede Route serverseitig neu rendert, aktualisiert sich
// die Markierung ohne Client-Code.
export default function DocsNav({ tree, spaceSlug, activeSlug }) {
    const href = (slug) => `/docs/${spaceSlug}/${slug}`;
    return (
        <nav className={styles.nav} aria-label="Dokumentation">
            {tree.map((grp) => (
                <div className={styles.navGroup} key={grp.group || '_'}>
                    {grp.group && <div className={styles.navGroupTitle}>{grp.group}</div>}
                    <ul>
                        {grp.items.map((item) => (
                            <li key={item.doc.id}>
                                <Link
                                    href={href(item.doc.slug)}
                                    className={item.doc.slug === activeSlug ? styles.navActive : ''}
                                >
                                    {item.doc.title}
                                </Link>
                                {item.children.length > 0 && (
                                    <ul className={styles.navChildren}>
                                        {item.children.map((c) => (
                                            <li key={c.id}>
                                                <Link
                                                    href={href(c.slug)}
                                                    className={c.slug === activeSlug ? styles.navActive : ''}
                                                >
                                                    {c.title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );
}
