import { FiLock, FiExternalLink } from 'react-icons/fi';
import RefSlider from './RefSlider';
import styles from './SharePrivateRefs.module.css';

// Vertraulicher Abschnitt einer Freigabe-Seite: Arbeitsproben, die nicht im
// öffentlichen Showcase stehen. Erscheint nur, wenn der Freigabe vertrauliche
// Referenzen zugeordnet sind. Karten liegen nebeneinander (responsive Grid).
//
// Wasserzeichen: ein diagonal wiederholter Text (Empfänger-Firma + Datum) als
// dezentes Overlay über jedem Screenshot. Bewusst nur ein ABSCHRECKUNGS-Mittel –
// die Bilder bleiben technisch abrufbar; für echten Schutz müsste das Zeichen
// serverseitig ins Bild eingebrannt werden (nicht Teil dieser Version).

const STATUS_LABEL = { live: 'live', in_entwicklung: 'in Entwicklung' };

function splitTech(tech) {
    return (tech || '').split(/[,\n]/).map((t) => t.trim()).filter(Boolean);
}

// SVG-Kachel mit dem Wasserzeichen-Text (als CSS-Hintergrund, gestochen scharf,
// keine externe Datei). Text wird XML-escaped. Rückgabe ist ein serialisierbares
// Style-Objekt (an die Client-Slider-Komponente übergebbar).
function watermarkStyle(text) {
    if (!text) return undefined;
    const safe = String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='170'>`
        + `<text x='0' y='95' transform='rotate(-28 160 85)' fill='rgba(127,127,127,0.30)' `
        + `font-family='Arial, sans-serif' font-size='17' font-weight='600'>${safe}</text></svg>`;
    return { backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")` };
}

function normalizeUrl(url) {
    const u = (url || '').trim();
    if (!u) return null;
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
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
                {items.map((r) => {
                    const tech = splitTech(r.tech);
                    const url = normalizeUrl(r.link);
                    return (
                        <article key={r.id} className={styles.card}>
                            {r.images?.length > 0 && (
                                <RefSlider images={r.images} title={r.title} wmStyle={wm} />
                            )}

                            <div className={styles.body}>
                                <div className={styles.cardHead}>
                                    <span className={styles.title}>{r.title}</span>
                                    <span className={`${styles.status}${r.status === 'in_entwicklung' ? ' ' + styles.statusDev : ''}`}>
                                        {STATUS_LABEL[r.status] || r.status}
                                    </span>
                                </div>
                                {r.context ? <p className={styles.context}>{r.context}</p> : null}

                                {r.description ? <p className={styles.desc}>{r.description}</p> : null}

                                {tech.length > 0 && (
                                    <div className={styles.tech}>
                                        {tech.map((t) => <span key={t} className={styles.chip}>{t}</span>)}
                                    </div>
                                )}

                                {url && (
                                    <a className={styles.liveLink} href={url} target="_blank" rel="noopener noreferrer nofollow">
                                        <FiExternalLink aria-hidden="true" /> {r.link_label || 'Live ansehen'}
                                    </a>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
