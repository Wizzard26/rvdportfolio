'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AiBadge from '@/components/ai/AiBadge';
import styles from './SharePrivateRefs.module.css';

// Bild-Bereich einer vertraulichen Referenz. Bei mehreren Screenshots ein
// einfacher Slider (Pfeile + Punkte); bei einem Bild einfach das Bild. Über jedem
// Bild liegt das Wasserzeichen-Overlay (wmStyle wird serverseitig gebaut und als
// serialisierbares Style-Objekt übergeben) und – falls markiert – das KI-Badge.
export default function RefSlider({ images = [], title = '', wmStyle }) {
    const [i, setI] = useState(0);
    if (!images.length) return null;

    const many = images.length > 1;
    const idx = Math.min(i, images.length - 1);
    const img = images[idx];
    const go = (d) => setI((prev) => (prev + d + images.length) % images.length);

    return (
        <div className={styles.slider}>
            <div className={styles.shot}>
                {img.ai_image ? <AiBadge /> : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image} alt={`${title} – Screenshot ${idx + 1}`} loading="lazy" />
                {wmStyle ? <span className={styles.watermark} style={wmStyle} aria-hidden="true" /> : null}

                {many && (
                    <>
                        <button type="button" className={`${styles.nav} ${styles.navPrev}`} onClick={() => go(-1)} aria-label="Vorheriges Bild">
                            <FiChevronLeft aria-hidden="true" />
                        </button>
                        <button type="button" className={`${styles.nav} ${styles.navNext}`} onClick={() => go(1)} aria-label="Nächstes Bild">
                            <FiChevronRight aria-hidden="true" />
                        </button>
                        <span className={styles.counter} aria-hidden="true">{idx + 1}/{images.length}</span>
                    </>
                )}
            </div>

            {many && (
                <div className={styles.dots}>
                    {images.map((im, k) => (
                        <button key={im.id ?? k} type="button"
                                className={k === idx ? styles.dotActive : styles.dot}
                                onClick={() => setI(k)} aria-label={`Bild ${k + 1} anzeigen`} />
                    ))}
                </div>
            )}
        </div>
    );
}
