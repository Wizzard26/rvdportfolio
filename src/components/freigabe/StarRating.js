'use client';

import { useState } from 'react';
import { TbStar, TbStarFilled } from 'react-icons/tb';
import styles from './response.module.css';

// Sterne-Bewertung (1–5). Der Wert landet im versteckten Feld `name`.
export default function StarRating({ name, label }) {
    const [value, setValue] = useState(0);
    const [hover, setHover] = useState(0);
    const active = hover || value;
    return (
        <div className={styles.rating}>
            <span className={styles.ratingLabel}>{label}</span>
            <span className={styles.stars} onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" className={styles.star} aria-label={`${n} von 5`}
                            onMouseEnter={() => setHover(n)} onClick={() => setValue(n === value ? 0 : n)}>
                        {n <= active ? <TbStarFilled /> : <TbStar />}
                    </button>
                ))}
            </span>
            <input type="hidden" name={name} value={value} />
        </div>
    );
}
