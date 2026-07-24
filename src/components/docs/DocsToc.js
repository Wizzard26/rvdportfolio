import styles from './docs.module.css';

// Rechtes Inhaltsverzeichnis (H2/H3 der aktuellen Seite). Die Anker-IDs stammen
// aus derselben slugify-Logik wie der Markdown-Renderer.
export default function DocsToc({ headings }) {
    if (!headings?.length) return null;
    return (
        <aside className={styles.toc}>
            <nav aria-label="Auf dieser Seite">
                <div className={styles.tocTitle}>Auf dieser Seite</div>
                <ul>
                    {headings.map((h, i) => (
                        <li key={i} className={h.level === 3 ? styles.tocSub : ''}>
                            <a href={`#${h.id}`}>{h.text}</a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
