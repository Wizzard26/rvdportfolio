'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiImage } from 'react-icons/fi';
import AiBadge from '@/components/ai/AiBadge';
import Lightbox from './Lightbox';
import styles from './gallery.module.css';

function isUpload(src) {
    return typeof src === 'string' && src.startsWith('/media/');
}

// Raster: großes Hero-Bild + Thumbnail-Reihe (2 sichtbar; ab >2 Thumbs scrollt
// die Reihe = „gleiten"). Klick öffnet die Lightbox an der Stelle.
export default function ProjectGallery({ images = [], name = '' }) {
    const [open, setOpen] = useState(-1);
    if (!images.length) return null;

    const hero = images[0];
    const rest = images.slice(1);

    return (
        <div className={styles.gallery}>
            <button type="button" className={styles.hero} onClick={() => setOpen(0)}
                    aria-label={images.length > 1 ? `${name}: alle ${images.length} Bilder ansehen` : `${name}: Bild vergrößern`}>
                {hero.ai_image ? <AiBadge /> : null}
                {images.length > 3 && (
                    <span className={styles.count} title={`Alle ${images.length} Bilder ansehen`}>
                        <FiImage aria-hidden="true" /> +{images.length - 3}
                    </span>
                )}
                <Image
                    className={styles.img}
                    src={hero.image}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    style={{ objectFit: 'cover' }}
                    unoptimized={isUpload(hero.image)}
                />
            </button>

            {rest.length > 0 && (
                <div className={`${styles.thumbs}${rest.length > 2 ? ' ' + styles.thumbsScroll : ''}`}>
                    {rest.map((img, i) => (
                        <button type="button" key={img.id} className={styles.thumb} onClick={() => setOpen(i + 1)} aria-label={`Bild ${i + 2} vergrößern`}>
                            {img.ai_image ? <AiBadge /> : null}
                            <Image
                                className={styles.img}
                                src={img.image}
                                alt=""
                                fill
                                sizes="24vw"
                                style={{ objectFit: 'cover' }}
                                loading="lazy"
                                unoptimized={isUpload(img.image)}
                            />
                        </button>
                    ))}
                </div>
            )}

            {open >= 0 && (
                <Lightbox images={images} index={open} onClose={() => setOpen(-1)} onIndex={setOpen} />
            )}
        </div>
    );
}
