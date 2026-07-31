'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './role-typer.module.css';

// Kompakte Typewriter-Zeile: tippt Rollen durch (schreiben → Pause → löschen →
// nächste). Winziger Fußabdruck, funktioniert auf allen Geräten. Dekorativ →
// für Screenreader eine statische Zusammenfassung, Animation aria-hidden.
// prefers-reduced-motion: zeigt nur die erste Rolle, ohne Animation.

const ROLES = [
    'Shopware-6-Entwickler',
    'Fullstack-Entwickler',
    'Plugin- & Theme-Entwickler',
    'React/Next.js-Entwickler',
    'Mediengestalter, der codet',
];

export default function RoleTyper() {
    const [text, setText] = useState('');
    const [reduce, setReduce] = useState(false);
    const ref = useRef(null);
    const pos = useRef({ roleIdx: 0, charIdx: 0, deleting: false });

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            setReduce(true);
            setText(ROLES[0]);
            return;
        }
        let timer;
        let active = false;
        const tick = () => {
            const s = pos.current;
            const role = ROLES[s.roleIdx];
            if (!s.deleting) {
                s.charIdx += 1;
                setText(role.slice(0, s.charIdx));
                if (s.charIdx === role.length) { s.deleting = true; timer = setTimeout(tick, 1500); return; }
                timer = setTimeout(tick, 62);
            } else {
                s.charIdx -= 1;
                setText(role.slice(0, s.charIdx));
                if (s.charIdx === 0) { s.deleting = false; s.roleIdx = (s.roleIdx + 1) % ROLES.length; timer = setTimeout(tick, 320); return; }
                timer = setTimeout(tick, 30);
            }
        };
        // Nur animieren, solange die Zeile im Sichtbereich ist (spart Timer/Main-Thread).
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !active) { active = true; timer = setTimeout(tick, 450); }
            else if (!e.isIntersecting) { active = false; clearTimeout(timer); }
        }, { threshold: 0 });
        if (ref.current) io.observe(ref.current);
        return () => { io.disconnect(); clearTimeout(timer); };
    }, []);

    return (
        <p className={styles.wrap} ref={ref}>
            <span className={styles.srOnly}>Rollen: {ROLES.join(', ')}.</span>
            <span aria-hidden="true">
                <span className={styles.prefix}>›</span>
                <span className={styles.role}>{text}</span>
                <span className={`${styles.cursor}${reduce ? '' : ' ' + styles.blink}`} />
            </span>
        </p>
    );
}
