'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MediaThumb from './MediaThumb';
import Lightbox from './Lightbox';
import styles from './slider.module.css';

// Rotierendes Element, aber MANUELL (kein Autoplay). Pfeile + Punkte; Klick öffnet
// die Lightbox an aktueller Stelle. Items: Bild, Video oder Embed (MediaThumb).
export default function ProjectSlider({ images = [], name = '' }) {
    const [i, setI] = useState(0);
    const [open, setOpen] = useState(false);
    if (!images.length) return null;

    const count = images.length;
    const cur = images[Math.min(i, count - 1)];
    const go = (d) => setI((prev) => (prev + d + count) % count);

    return (
        <div className={styles.slider}>
            <div className={styles.stage}>
                <button type="button" className={styles.imgBtn} onClick={() => setOpen(true)} aria-label={`${name}: Medium vergrößern`}>
                    <MediaThumb item={cur} name={name} sizes="(max-width: 768px) 100vw, 45vw" />
                </button>
                {count > 1 && (
                    <>
                        <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => go(-1)} aria-label="Vorheriges Medium">
                            <FiChevronLeft aria-hidden="true" />
                        </button>
                        <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => go(1)} aria-label="Nächstes Medium">
                            <FiChevronRight aria-hidden="true" />
                        </button>
                    </>
                )}
            </div>

            {count > 1 && (
                <div className={styles.dots} role="tablist" aria-label="Medienauswahl">
                    {images.map((img, d) => (
                        <button
                            key={img.id}
                            type="button"
                            className={`${styles.dot}${d === i ? ' ' + styles.dotOn : ''}`}
                            onClick={() => setI(d)}
                            aria-label={`Medium ${d + 1}`}
                            aria-current={d === i}
                        />
                    ))}
                </div>
            )}

            {open && (
                <Lightbox images={images} index={i} onClose={() => setOpen(false)} onIndex={setI} />
            )}
        </div>
    );
}
