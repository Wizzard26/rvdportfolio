'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AiBadge from '@/components/ai/AiBadge';
import Lightbox from './Lightbox';
import styles from './slider.module.css';

function isUpload(src) {
    return typeof src === 'string' && src.startsWith('/media/');
}

// Rotierendes Bild-Element, aber MANUELL (kein Autoplay — nervt ohne Video).
// Pfeile + Punkte; Klick aufs Bild öffnet die Lightbox an aktueller Stelle.
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
                {cur.ai_image ? <AiBadge /> : null}
                <button type="button" className={styles.imgBtn} onClick={() => setOpen(true)} aria-label={`${name}: Bild vergrößern`}>
                    <Image
                        className={styles.img}
                        src={cur.image}
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 100vw, 45vw"
                        style={{ objectFit: 'cover' }}
                        unoptimized={isUpload(cur.image)}
                    />
                </button>
                {count > 1 && (
                    <>
                        <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => go(-1)} aria-label="Vorheriges Bild">
                            <FiChevronLeft aria-hidden="true" />
                        </button>
                        <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => go(1)} aria-label="Nächstes Bild">
                            <FiChevronRight aria-hidden="true" />
                        </button>
                    </>
                )}
            </div>

            {count > 1 && (
                <div className={styles.dots} role="tablist" aria-label="Bildauswahl">
                    {images.map((img, d) => (
                        <button
                            key={img.id}
                            type="button"
                            className={`${styles.dot}${d === i ? ' ' + styles.dotOn : ''}`}
                            onClick={() => setI(d)}
                            aria-label={`Bild ${d + 1}`}
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
