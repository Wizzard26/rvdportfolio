import { FaQuoteLeft } from 'react-icons/fa';
import styles from './testimonials.module.css';

// Referenzen / Stimmen (Social Proof). Wiederverwendbar:
//  - variant="full"    → Sektion mit Überschrift (Showcase / About)
//  - variant="compact" → schlanke Karte für die Freigabe-Seite
// Rendert nichts, wenn keine (aktiven) Stimmen übergeben werden.
export default function Testimonials({ items = [], variant = 'full', heading = 'Das sagen andere', centered = false }) {
    if (!items || items.length === 0) return null;
    const compact = variant === 'compact';
    const cls = [styles.wrap, compact ? styles.compact : '', centered ? styles.centered : ''].filter(Boolean).join(' ');

    return (
        <section className={cls} aria-label={heading}>
            {heading && <h2 className={compact ? styles.compactTitle : styles.title}>{heading}</h2>}
            <ul className={styles.grid}>
                {items.map((t) => (
                    <li key={t.id} className={styles.card}>
                        <FaQuoteLeft aria-hidden="true" className={styles.mark} />
                        <blockquote className={styles.quote}>{t.quote}</blockquote>
                        <div className={styles.cite}>
                            <span className={styles.author}>{t.author}</span>
                            {(t.role || t.company) && (
                                <span className={styles.meta}>
                                    {[t.role, t.company].filter(Boolean).join(' · ')}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
