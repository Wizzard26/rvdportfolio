'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics/track';

// Meldet EINMAL, wenn ein Abschnitt (z. B. ein Showcase-Projekt) zu mindestens
// der Hälfte sichtbar wird — so sehen wir, welche Inhalte tatsächlich in den
// Blick geraten, nicht nur welche Seite geöffnet wurde. `as` erlaubt es, das
// umschließende Element zu wählen (Default div), damit bestehendes Layout/CSS
// nicht bricht.
export default function SectionView({ name, as: Tag = 'div', className, children }) {
    const ref = useRef(null);
    const fired = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || fired.current) return;

        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting && !fired.current) {
                    fired.current = true;
                    track('section_view', { name });
                    observer.disconnect();
                }
            }
        }, { threshold: 0.5 });

        observer.observe(el);
        return () => observer.disconnect();
    }, [name]);

    return <Tag ref={ref} className={className}>{children}</Tag>;
}
