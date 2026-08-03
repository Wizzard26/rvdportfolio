import { FiLock } from 'react-icons/fi';
import styles from './SharePrivateRefs.module.css';
import PrivateRefCard from './PrivateRefCard';

// Vertraulicher Abschnitt einer Freigabe-Seite: Arbeitsproben, die nicht im
// öffentlichen Showcase stehen. Erscheint nur, wenn der Freigabe vertrauliche
// Referenzen zugeordnet sind. Karten liegen im 2-Spalten-Raster (je 50 % auf
// Desktop, auch eine einzelne Karte; darunter responsiv einspaltig).
//
// Wasserzeichen: ein diagonal wiederholter Text (Empfänger-Firma + Datum) als
// dezentes Overlay über jedem Screenshot. Bewusst nur ein ABSCHRECKUNGS-Mittel –
// die Bilder bleiben technisch abrufbar; für echten Schutz müsste das Zeichen
// serverseitig ins Bild eingebrannt werden (nicht Teil dieser Version).

// SVG-Kachel mit dem Wasserzeichen-Text (als CSS-Hintergrund, gestochen scharf,
// keine externe Datei). Text wird XML-escaped. Rückgabe ist ein serialisierbares
// Style-Objekt (an die Client-Karte/-Slider übergebbar).
function watermarkStyle(text) {
    if (!text) return undefined;
    const safe = String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='170'>`
        + `<text x='0' y='95' transform='rotate(-28 160 85)' fill='rgba(127,127,127,0.30)' `
        + `font-family='Arial, sans-serif' font-size='17' font-weight='600'>${safe}</text></svg>`;
    return { backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")` };
}

export default function SharePrivateRefs({ items = [], company = '', stamp = '' }) {
    if (!items.length) return null;

    const wmText = [company, stamp].filter(Boolean).join('  ·  ');
    const wm = watermarkStyle(wmText);

    return (
        <section className={styles.wrap} aria-label="Vertrauliche Einblicke">
            <p className={styles.banner}>
                <FiLock aria-hidden="true" className={styles.bannerIcon} />
                <span>Die folgenden Projekte zeige ich Ihnen ganz bewusst nur hier – einige sind noch nicht
                    öffentlich, bei anderen liegen die Rechte bei meinen Kunden. Ich freue mich, dass ich
                    Ihnen einen persönlichen Einblick geben darf, und bitte Sie, ihn vertraulich zu behandeln.</span>
            </p>

            <h2 className={styles.heading}>Vertrauliche Einblicke</h2>

            <div className={styles.grid}>
                {items.map((r) => <PrivateRefCard key={r.id} item={r} wm={wm} />)}
            </div>
        </section>
    );
}
