'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './profile-terminal.module.css';

// Interaktiver „Boot"-Hero für /about-me: ein Terminal, das das Profil hochfährt
// (getippte Befehle + Ausgabe, blinkender Cursor). Zeigt Können statt es nur zu
// behaupten. Klick überspringt die Animation; prefers-reduced-motion zeigt alles
// sofort. Rein clientseitig, keine Abhängigkeiten.

// Zeilen = Arrays von Tokens { t: Text, c: Farbklasse }. Leere Zeile = [].
const LINES = [
    [{ t: '$ ', c: 'prompt' }, { t: 'whoami', c: 'cmd' }],
    [{ t: 'René van Dinter — Shopware-6- & Fullstack-Entwickler', c: 'out' }],
    [],
    [{ t: '$ ', c: 'prompt' }, { t: 'cat stack.json', c: 'cmd' }],
    [{ t: '{', c: 'punc' }],
    [{ t: '  "shopware": ', c: 'key' }, { t: '["Plugins", "Apps", "Themes"]', c: 'val' }],
    [{ t: '  "frontend": ', c: 'key' }, { t: '["React", "Next.js", "TypeScript"]', c: 'val' }],
    [{ t: '  "backend":  ', c: 'key' }, { t: '["PHP", "Symfony", "Node.js"]', c: 'val' }],
    [{ t: '  "und_mehr": ', c: 'key' }, { t: '["Docker", "CI/CD", "Clean Code", "TDD"]', c: 'val' }],
    [{ t: '}', c: 'punc' }],
    [],
    [{ t: '$ ', c: 'prompt' }, { t: 'experience --years', c: 'cmd' }],
    [{ t: '15+ Jahre aus Agentur & E-Commerce', c: 'out' }],
    [],
    [{ t: '$ ', c: 'prompt' }, { t: 'status', c: 'cmd' }],
    [{ t: '● ', c: 'ok' }, { t: 'verfügbar für neue Herausforderungen', c: 'out' }],
];

const TOTAL = LINES.reduce((s, line) => s + line.reduce((a, tok) => a + tok.t.length, 0), 0);

export default function ProfileTerminal() {
    const [rev, setRev] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef(null);

    // Erst starten, wenn das Terminal ins Bild scrollt.
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setStarted(true); io.disconnect(); }
        }, { threshold: 0.3 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    useEffect(() => {
        if (!started) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setRev(TOTAL); return; }
        const id = setInterval(() => {
            setRev((r) => { if (r >= TOTAL) { clearInterval(id); return r; } return r + 1; });
        }, 14);
        return () => clearInterval(id);
    }, [started]);

    // Zeilen bis zum aktuellen Reveal-Budget aufbauen; Cursor an die aktuelle Stelle.
    let budget = rev;
    let cursorPlaced = false;
    const rendered = LINES.map((line, li) => {
        const parts = [];
        for (let ti = 0; ti < line.length; ti++) {
            const tok = line[ti];
            if (budget <= 0) break;
            const take = Math.min(tok.t.length, budget);
            parts.push(<span key={ti} className={styles[tok.c]}>{tok.t.slice(0, take)}</span>);
            budget -= take;
        }
        const isCursorLine = !cursorPlaced && budget <= 0;
        if (isCursorLine) cursorPlaced = true;
        return (
            <div key={li} className={styles.line}>
                {parts}
                {isCursorLine && <span className={`${styles.cursor} ${styles.cursorBlink}`} aria-hidden="true" />}
                {parts.length === 0 ? ' ' : null}
            </div>
        );
    });

    return (
        <div className={styles.termWrap}>
            <div
                ref={ref}
                className={styles.term}
                onClick={() => setRev(TOTAL)}
                role="img"
                aria-label="Terminal: René van Dinter – Shopware-6- und Fullstack-Entwickler, 15+ Jahre Erfahrung, verfügbar für neue Herausforderungen."
            >
                <div className={styles.bar}>
                    <span className={styles.dots}><i /><i /><i /></span>
                    <span className={styles.barTitle}>rene@portfolio: ~</span>
                </div>
                <pre className={styles.body}>
                    {rendered}
                </pre>
            </div>
        </div>
    );
}
