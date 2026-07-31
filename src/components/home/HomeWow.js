'use client';

import { useEffect, useRef, useState } from 'react';
import { FiShield, FiLock, FiCpu, FiCode, FiZap, FiMessageCircle } from 'react-icons/fi';
import { roboto, roboto_condensed } from '@/app/fonts';
import styles from './home-wow.module.css';

// „Wow auf den ersten Blick" direkt unter dem Hero: eine Beweisleiste (die Seite
// selbst als Portfolio), hochzählende Kennzahlen und ein sichtbarer Aufhänger zum
// KI-Assistenten. Alles ehrlich aus dem, was bereits gebaut wurde.

const PROOFS = [
    { icon: FiShield, text: '100/100 Barrierefreiheit' },
    { icon: FiLock, text: 'Cookiefrei & DSGVO-freundlich' },
    { icon: FiCode, text: 'Selbst gebaut – kein Baukasten' },
    { icon: FiCpu, text: 'Eigener KI-Assistent' },
    { icon: FiZap, text: 'Next.js 16 · schnell' },
];

// Zählt eine Zahl hoch, sobald sie ins Bild scrollt (respektiert reduce-motion).
function useCountUp(target, run) {
    const [n, setN] = useState(0);
    useEffect(() => {
        if (!run) return;
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { setN(target); return; }
        let raf;
        const dur = 1100;
        const t0 = performance.now();
        const tick = (t) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            setN(Math.round(target * eased));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, run]);
    return n;
}

function Stat({ value, suffix, label, run }) {
    const n = useCountUp(value, run);
    return (
        <div className={styles.stat}>
            <span className={`${roboto.className} ${styles.statValue}`}>{n}{suffix}</span>
            <span className={styles.statLabel}>{label}</span>
        </div>
    );
}

export default function HomeWow({ years = 15, projects = 0, articles = 0 }) {
    const ref = useRef(null);
    const [run, setRun] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setRun(true); io.disconnect(); }
        }, { threshold: 0.35 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const openAssistant = () => window.dispatchEvent(new CustomEvent('assistant:open'));

    return (
        <section className={styles.wrap} aria-label="Auf einen Blick">
            <div className="content-inner">
                {/* Beweisleiste */}
                <ul className={styles.proofs}>
                    {PROOFS.map((p) => (
                        <li key={p.text} className={styles.proof}>
                            <p.icon aria-hidden="true" /> <span>{p.text}</span>
                        </li>
                    ))}
                </ul>

                <div className={styles.grid} ref={ref}>
                    {/* Kennzahlen */}
                    <div className={styles.stats}>
                        <Stat value={years} suffix="+" label="Jahre Erfahrung" run={run} />
                        <Stat value={projects} suffix="" label="Projekte im Showcase" run={run} />
                        <Stat value={articles} suffix="" label="Blog- & Doku-Artikel" run={run} />
                    </div>

                    {/* KI-Assistent-Aufhänger */}
                    <div className={styles.assistant}>
                        <div className={styles.assistantIcon}><FiMessageCircle aria-hidden="true" /></div>
                        <div className={styles.assistantBody}>
                            <p className={`${roboto.className} ${styles.assistantTitle}`}>Neugierig, ob ich passe?</p>
                            <p className={styles.assistantText}>
                                Fragen Sie meinen KI-Assistenten alles über meine Erfahrung, Projekte oder Verfügbarkeit –
                                er antwortet nur aus meinen echten Unterlagen.
                            </p>
                        </div>
                        <button type="button" className={`${roboto_condensed.className} ${styles.assistantBtn}`} onClick={openAssistant}>
                            <FiMessageCircle aria-hidden="true" /> KI-Assistent fragen
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
