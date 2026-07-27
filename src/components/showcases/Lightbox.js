'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AiBadge from '@/components/ai/AiBadge';
import styles from './lightbox.module.css';

function isUpload(src) {
    return typeof src === 'string' && src.startsWith('/media/');
}

// Vollbild-Ansicht mit Vor/Zurück. Barrierearm: role=dialog, Esc schließt,
// Pfeiltasten blättern, Body-Scroll gesperrt, Fokus im Dialog. Kein Autoplay.
export default function Lightbox({ images, index, onClose, onIndex }) {
    const dialogRef = useRef(null);
    const count = images.length;
    const cur = images[index];

    const prev = useCallback(() => onIndex((index - 1 + count) % count), [index, count, onIndex]);
    const next = useCallback(() => onIndex((index + 1) % count), [index, count, onIndex]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft' && count > 1) prev();
            else if (e.key === 'ArrowRight' && count > 1) next();
        };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialogRef.current?.focus();
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose, prev, next, count]);

    if (!cur) return null;

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label="Bildergalerie"
            ref={dialogRef}
            tabIndex={-1}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <button type="button" className={styles.close} onClick={onClose} aria-label="Schließen"><FiX aria-hidden="true" /></button>

            {count > 1 && (
                <button type="button" className={`${styles.nav} ${styles.navPrev}`} onClick={prev} aria-label="Vorheriges Bild">
                    <FiChevronLeft aria-hidden="true" />
                </button>
            )}

            <figure className={styles.figure} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
                <div className={styles.imgWrap}>
                    {cur.ai_image ? <AiBadge /> : null}
                    <Image
                        className={styles.img}
                        src={cur.image}
                        alt=""
                        fill
                        sizes="92vw"
                        style={{ objectFit: 'contain' }}
                        unoptimized={isUpload(cur.image)}
                    />
                </div>
                {count > 1 && <figcaption className={styles.counter}>{index + 1} / {count}</figcaption>}
            </figure>

            {count > 1 && (
                <button type="button" className={`${styles.nav} ${styles.navNext}`} onClick={next} aria-label="Nächstes Bild">
                    <FiChevronRight aria-hidden="true" />
                </button>
            )}
        </div>
    );
}
