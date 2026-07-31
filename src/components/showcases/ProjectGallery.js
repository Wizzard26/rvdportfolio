'use client';

import { useState } from 'react';
import { FiImage } from 'react-icons/fi';
import MediaThumb from './MediaThumb';
import Lightbox from './Lightbox';
import styles from './gallery.module.css';

// Raster: großes Hero-Medium + Thumbnail-Reihe (2 sichtbar; ab >2 Thumbs scrollt
// die Reihe = „gleiten"). Klick öffnet die Lightbox an der Stelle. Items können
// Bild, hochgeladenes Video oder YouTube/Vimeo-Embed sein (MediaThumb rendert das).
export default function ProjectGallery({ images = [], name = '' }) {
    const [open, setOpen] = useState(-1);
    if (!images.length) return null;

    const hero = images[0];
    const rest = images.slice(1);

    return (
        <div className={styles.gallery}>
            <button type="button" className={styles.hero} onClick={() => setOpen(0)}
                    aria-label={images.length > 1 ? `${name}: alle ${images.length} Medien ansehen` : `${name}: Medium vergrößern`}>
                {images.length > 3 && (
                    <span className={styles.count} aria-hidden="true" title={`Alle ${images.length} Medien ansehen`}>
                        <FiImage aria-hidden="true" /> +{images.length - 3}
                    </span>
                )}
                <MediaThumb item={hero} name={name} sizes="(max-width: 768px) 100vw, 45vw" />
            </button>

            {rest.length > 0 && (
                <div className={`${styles.thumbs}${rest.length > 2 ? ' ' + styles.thumbsScroll : ''}`}>
                    {rest.map((img, i) => (
                        <button type="button" key={img.id} className={styles.thumb} onClick={() => setOpen(i + 1)} aria-label={`Medium ${i + 2} vergrößern`}>
                            <MediaThumb item={img} sizes="24vw" />
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
