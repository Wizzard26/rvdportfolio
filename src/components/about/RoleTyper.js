'use client';

import { useEffect, useState } from 'react';
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

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            setReduce(true);
            setText(ROLES[0]);
            return;
        }
        let roleIdx = 0;
        let charIdx = 0;
        let deleting = false;
        let timer;
        const tick = () => {
            const role = ROLES[roleIdx];
            if (!deleting) {
                charIdx += 1;
                setText(role.slice(0, charIdx));
                if (charIdx === role.length) { deleting = true; timer = setTimeout(tick, 1500); return; }
                timer = setTimeout(tick, 62);
            } else {
                charIdx -= 1;
                setText(role.slice(0, charIdx));
                if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % ROLES.length; timer = setTimeout(tick, 320); return; }
                timer = setTimeout(tick, 30);
            }
        };
        timer = setTimeout(tick, 450);
        return () => clearTimeout(timer);
    }, []);

    return (
        <p className={styles.wrap}>
            <span className={styles.srOnly}>Rollen: {ROLES.join(', ')}.</span>
            <span aria-hidden="true">
                <span className={styles.prefix}>›</span>
                <span className={styles.role}>{text}</span>
                <span className={`${styles.cursor}${reduce ? '' : ' ' + styles.blink}`} />
            </span>
        </p>
    );
}
