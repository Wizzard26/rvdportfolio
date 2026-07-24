'use client';
import { useEffect, useRef, useState } from 'react';

// Meldet, ob das referenzierte Element (einmalig) in den Viewport gescrollt
// wurde. Bewusst robust: Fehlt IntersectionObserver (sehr alte Browser), wird
// sofort `true` gemeldet – der Inhalt bleibt also sichtbar, statt hängenzubleiben.
export function useInView({ once = true, rootMargin = '0px 0px -8% 0px' } = {}) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    if (once) io.disconnect();
                } else if (!once) {
                    setInView(false);
                }
            });
        }, { rootMargin });
        io.observe(el);
        return () => io.disconnect();
    }, [once, rootMargin]);

    return [ref, inView];
}
