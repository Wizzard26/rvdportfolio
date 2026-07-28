'use client';

import Image from 'next/image';
import { FiPlay } from 'react-icons/fi';
import AiBadge from '@/components/ai/AiBadge';
import { itemKind, embedInfo } from '@/lib/videoEmbed';
import styles from './media.module.css';

function isUpload(src) {
    return typeof src === 'string' && src.startsWith('/media/');
}

// Vorschau eines Galerie-/Slider-Items (Bild, hochgeladenes Video oder Embed).
// Sitzt in einer bereits formatgebundenen, position:relative-Box der Eltern.
// Klick/Vergrößern übernimmt die Eltern-Komponente (Button + Lightbox).
export default function MediaThumb({ item, name = '', sizes = '45vw' }) {
    const kind = itemKind(item);

    if (kind === 'video') {
        return (
            <>
                {item.ai_image ? <AiBadge label="KI-Video" /> : null}
                {/* #t=0.1 → Browser zeigt das erste Frame als Vorschau; abgespielt in der Lightbox. */}
                <video className={styles.fill} src={`${item.image}#t=0.1`} muted playsInline preload="metadata" tabIndex={-1} />
                <span className={styles.playOverlay}><FiPlay aria-hidden="true" /></span>
            </>
        );
    }

    if (kind === 'embed') {
        const info = embedInfo(item.image);
        const p = info?.provider === 'Vimeo' ? 'vimeo' : 'youtube';
        // Vorschau über den eigenen Proxy (kein Besucher-Request an Google/Vimeo);
        // das eigentliche iframe lädt erst beim Klick (Facade).
        return (
            <>
                {item.ai_image ? <AiBadge label="KI-Video" /> : null}
                <span className={styles.provider}>{info?.provider || 'Video'}</span>
                {info?.id ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.fill} src={`/api/embedthumb?p=${p}&id=${info.id}`} alt="" loading="lazy" />
                ) : (
                    <span className={styles.embedTile} />
                )}
                <span className={styles.playOverlay}><FiPlay aria-hidden="true" /></span>
            </>
        );
    }

    // Bild (Standard, inkl. Alt-Datensätze ohne kind)
    return (
        <>
            {item.ai_image ? <AiBadge /> : null}
            <Image
                src={item.image}
                alt={name}
                fill
                sizes={sizes}
                style={{ objectFit: 'cover' }}
                unoptimized={isUpload(item.image)}
            />
        </>
    );
}
