'use client';

import { useState } from 'react';
import styles from './offer.module.css';

// Doppel-Schieber (min/max), z. B. für die Gehaltsrange. Sendet zwei versteckte
// Felder (nameMin/nameMax).
export function DualRange({ nameMin, nameMax, min, max, step, defMin, defMax, format }) {
    const [lo, setLo] = useState(defMin);
    const [hi, setHi] = useState(defMax);
    const pct = (v) => ((v - min) / (max - min)) * 100;
    const onLo = (val) => setLo(Math.min(Number(val), hi - step));
    const onHi = (val) => setHi(Math.max(Number(val), lo + step));
    const fmt = format || ((v) => v);

    return (
        <div className={styles.range}>
            <div className={styles.rangeValue}>{fmt(lo)} – {fmt(hi)}</div>
            <div className={styles.rangeTrack}>
                <div className={styles.rangeFill} style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
                <input type="range" min={min} max={max} step={step} value={lo}
                       onChange={(e) => onLo(e.target.value)} className={styles.rangeThumb} aria-label="Minimum" />
                <input type="range" min={min} max={max} step={step} value={hi}
                       onChange={(e) => onHi(e.target.value)} className={styles.rangeThumb} aria-label="Maximum" />
            </div>
            <input type="hidden" name={nameMin} value={lo} />
            <input type="hidden" name={nameMax} value={hi} />
        </div>
    );
}

// Einzel-Schieber, z. B. Stunden/Woche oder Urlaubstage.
export function SingleRange({ name, min, max, step, def, format }) {
    const [val, setVal] = useState(def);
    const fmt = format || ((v) => v);
    const pct = ((val - min) / (max - min)) * 100;
    return (
        <div className={styles.range}>
            <div className={styles.rangeValue}>{fmt(val)}</div>
            <input type="range" min={min} max={max} step={step} value={val}
                   onChange={(e) => setVal(Number(e.target.value))} className={styles.singleRange}
                   style={{ '--fill': `${pct}%` }} name={name} />
        </div>
    );
}
