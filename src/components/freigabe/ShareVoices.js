'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaQuoteLeft } from 'react-icons/fa';
import styles from './voices.module.css';

function Card({ t }) {
    const meta = [t.role, t.company].filter(Boolean).join(' · ');
    return (
        <figure className={styles.card}>
            <FaQuoteLeft aria-hidden="true" className={styles.mark} />
            <blockquote className={styles.quote}>{t.quote}</blockquote>
            <figcaption className={styles.cite}>
                <span className={styles.author}>{t.author}</span>
                {meta && <span className={styles.meta}>{meta}</span>}
            </figcaption>
        </figure>
    );
}

// Stimmen-Karte für die Freigabe-Seite. Eine Stimme → statische Karte; mehrere →
// manueller Slider (Pfeile + Punkte, kein Autoplay). Neben der „Auf einen Blick“-Box.
export default function ShareVoices({ items = [], heading = 'Stimmen' }) {
    const [i, setI] = useState(0);
    if (!items || items.length === 0) return null;

    const many = items.length > 1;
    const index = Math.min(i, items.length - 1);
    const go = (d) => setI((p) => (p + d + items.length) % items.length);

    return (
        <section className={styles.wrap} aria-label={heading}>
            <h2 className={styles.title}>{heading}</h2>
            <Card t={items[index]} />
            {many && (
                <div className={styles.nav}>
                    <button type="button" className={styles.arrow} onClick={() => go(-1)} aria-label="Vorherige Stimme">
                        <FiChevronLeft aria-hidden="true" />
                    </button>
                    <div className={styles.dots} role="tablist">
                        {items.map((t, k) => (
                            <button key={t.id} type="button" onClick={() => setI(k)}
                                    className={k === index ? styles.dotOn : styles.dot}
                                    aria-label={`Stimme ${k + 1} von ${items.length}`}
                                    aria-selected={k === index} />
                        ))}
                    </div>
                    <button type="button" className={styles.arrow} onClick={() => go(1)} aria-label="Nächste Stimme">
                        <FiChevronRight aria-hidden="true" />
                    </button>
                </div>
            )}
        </section>
    );
}
