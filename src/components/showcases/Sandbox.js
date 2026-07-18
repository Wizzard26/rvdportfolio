'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./styles.module.css";

// Isolierter Runner für admin-gepflegte HTML/CSS/JS-Demos (Phase B).
//
// Sicherheit: der Inhalt läuft in einem <iframe sandbox="allow-scripts">
// OHNE `allow-same-origin` — der Frame liegt damit in einem eigenen (null-)
// Origin und kann NICHT auf Cookies, DOM oder localStorage der Hauptseite
// zugreifen. `allow-modals` erlaubt alert/confirm in Demos. Der eingebettete
// Code stammt aus dem geschützten Admin (Renés eigene Inhalte); die Sandbox
// schützt zusätzlich die Besucher:innen vor fehlerhaftem/fremdem Code.
//
// Höhe: der Frame meldet seine Inhaltshöhe per postMessage an die Seite zurück
// (der Frame ist origin-los, daher wird auf die Quelle, nicht die Origin geprüft).

function buildDoc(html, css, js) {
    // </script> / </style> im Nutzercode entschärfen, damit der Wrapper nicht bricht.
    const safeJs = String(js || '').replace(/<\/script/gi, '<\\/script');
    const safeCss = String(css || '').replace(/<\/style/gi, '<\\/style');
    return `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0}body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:14px;color:#04151f}
${safeCss}</style></head>
<body>${html || ''}
<script>${safeJs}
;(function(){function h(){try{parent.postMessage({__sbHeight:document.documentElement.scrollHeight},'*')}catch(e){}}
if(window.ResizeObserver){new ResizeObserver(h).observe(document.documentElement)}
window.addEventListener('load',h);window.addEventListener('resize',h);setTimeout(h,60);h();})();
</script></body></html>`;
}

export default function Sandbox({ html = '', css = '', js = '', title = '' }) {
    const ref = useRef(null);
    const [height, setHeight] = useState(280);
    const doc = useMemo(() => buildDoc(html, css, js), [html, css, js]);

    useEffect(() => {
        const onMsg = (e) => {
            if (!ref.current || e.source !== ref.current.contentWindow) return;
            const h = e.data && e.data.__sbHeight;
            if (typeof h === 'number' && h > 0) setHeight(Math.min(2000, Math.max(120, Math.ceil(h))));
        };
        window.addEventListener('message', onMsg);
        return () => window.removeEventListener('message', onMsg);
    }, []);

    return (
        <iframe
            ref={ref}
            className={styles.sandboxFrame}
            sandbox="allow-scripts allow-modals"
            srcDoc={doc}
            title={title || 'Interaktive Demo'}
            loading="lazy"
            style={{ height }}
        />
    );
}
