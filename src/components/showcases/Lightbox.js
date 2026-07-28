'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AiBadge from '@/components/ai/AiBadge';
import { itemKind, embedInfo } from '@/lib/videoEmbed';
import styles from './lightbox.module.css';
import media from './media.module.css';

function isUpload(src) {
    return typeof src === 'string' && src.startsWith('/media/');
}

// Vollbild-Ansicht mit Vor/Zurück. Barrierearm: role=dialog, Esc schließt,
// Pfeiltasten blättern, Body-Scroll gesperrt, Fokus im Dialog. Items: Bild,
// hochgeladenes Video (Player) oder YouTube/Vimeo-Embed (iframe). Kein Autoplay
// bei Bildern; Video/Embed starten beim Öffnen (bewusste Nutzeraktion).
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
    const kind = itemKind(cur);
    const embed = kind === 'embed' ? embedInfo(cur.image) : null;
    const autoplay = !!cur.autoplay; // je Item; startet immer stumm
    // Autoplay startet STUMM (Browser-Policy + Nutzerwunsch); Ton erst, wenn der
    // Nutzer aktiv startet/entstummt. Ohne Autoplay: pausiert, Nutzer startet mit Ton.
    let embedSrc = embed?.src;
    if (embed && autoplay) {
        const sep = embedSrc.includes('?') ? '&' : '?';
        embedSrc = `${embedSrc}${sep}autoplay=1&${embed.provider === 'Vimeo' ? 'muted=1' : 'mute=1'}`;
    }

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label="Mediengalerie"
            ref={dialogRef}
            tabIndex={-1}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <button type="button" className={styles.close} onClick={onClose} aria-label="Schließen"><FiX aria-hidden="true" /></button>

            {count > 1 && (
                <button type="button" className={`${styles.nav} ${styles.navPrev}`} onClick={prev} aria-label="Vorheriges Medium">
                    <FiChevronLeft aria-hidden="true" />
                </button>
            )}

            <figure className={styles.figure} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
                {kind === 'video' ? (
                    // key=index → beim Blättern remountet der Player (altes Video stoppt).
                    // Autoplay nur stumm; ohne Autoplay pausiert (Nutzer startet mit Ton).
                    <span key={index} className={media.lightWrap}>
                        {cur.ai_image ? <AiBadge label="KI-Video" /> : null}
                        <video className={media.lightVideo} src={cur.image} controls autoPlay={autoplay} muted={autoplay} playsInline />
                    </span>
                ) : kind === 'embed' && embed ? (
                    <div key={index} className={media.lightEmbed}>
                        {cur.ai_image ? <AiBadge label="KI-Video" /> : null}
                        <iframe
                            src={embedSrc}
                            title={`${embed.provider}-Video`}
                            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                            allowFullScreen
                        />
                    </div>
                ) : (
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
                )}
                {count > 1 && <figcaption className={styles.counter}>{index + 1} / {count}</figcaption>}
            </figure>

            {count > 1 && (
                <button type="button" className={`${styles.nav} ${styles.navNext}`} onClick={next} aria-label="Nächstes Medium">
                    <FiChevronRight aria-hidden="true" />
                </button>
            )}
        </div>
    );
}
