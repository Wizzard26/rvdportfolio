import { FiLock } from 'react-icons/fi';
import AiBadge from '@/components/ai/AiBadge';
import styles from './SharePrivateRefs.module.css';

// Vertraulicher Abschnitt einer Freigabe-Seite: Arbeitsproben, die nicht im
// öffentlichen Showcase stehen. Erscheint nur, wenn der Freigabe vertrauliche
// Referenzen zugeordnet sind. Server-Komponente (kein Client-State nötig).
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
// keine externe Datei). Text wird XML-escaped.
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
                <span><strong>Vertraulich</strong> – diese Einblicke sind nur zur persönlichen Ansicht bestimmt.
                    Bitte nicht weitergeben, kopieren oder veröffentlichen.</span>
            </p>

            <h2 className={styles.heading}>Vertrauliche Einblicke</h2>

            {items.map((r) => (
                <article key={r.id} className={styles.card}>
                    <div className={styles.cardHead}>
                        <span className={styles.title}>{r.title}</span>
                        {r.context ? <span className={styles.context}>{r.context}</span> : null}
                        <span className={`${styles.status}${r.status === 'in_entwicklung' ? ' ' + styles.statusDev : ''}`}>
                            {STATUS_LABEL[r.status] || r.status}
                        </span>
                    </div>

                    {r.description ? <p className={styles.desc}>{r.description}</p> : null}

                    {splitTech(r.tech).length > 0 && (
                        <div className={styles.tech}>
                            {splitTech(r.tech).map((t) => <span key={t} className={styles.chip}>{t}</span>)}
                        </div>
                    )}

                    {r.images?.length > 0 && (
                        <div className={styles.shots}>
                            {r.images.map((img) => (
                                <div key={img.id} className={styles.shot}>
                                    {img.ai_image ? <AiBadge /> : null}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img.image} alt={`${r.title} – Screenshot`} loading="lazy" />
                                    {wm ? <span className={styles.watermark} style={wm} aria-hidden="true" /> : null}
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            ))}
        </section>
    );
}
