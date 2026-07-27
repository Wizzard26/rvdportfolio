import { FiTarget, FiClock, FiBriefcase, FiMapPin } from 'react-icons/fi';
import { LuBadgeEuro } from 'react-icons/lu';
import { buildKeyfacts } from '@/lib/shareTemplate';
import styles from './keyfacts.module.css';

// Scannbare „Auf einen Blick“-Karte für die Freigabe-Seite. Zeigt nur, was
// tatsächlich gepflegt ist – leere Angaben fallen weg (buildKeyfacts liefert null,
// wenn gar nichts vorhanden ist, dann rendert die Karte nicht).
export default function ShareKeyfacts({ share }) {
    const f = buildKeyfacts(share);
    if (!f) return null;

    const rows = [
        f.position && { icon: <FiTarget aria-hidden="true" />, label: 'Position', value: f.position },
        f.availability && { icon: <FiClock aria-hidden="true" />, label: 'Verfügbar', value: f.availability },
        f.model && { icon: <FiBriefcase aria-hidden="true" />, label: 'Modell', value: f.model },
        f.salary && { icon: <LuBadgeEuro aria-hidden="true" />, label: 'Gehaltsrahmen', value: f.salary },
        f.mobility && { icon: <FiMapPin aria-hidden="true" />, label: 'Standort', value: f.mobility },
    ].filter(Boolean);

    return (
        <div className={styles.wrap}>
        <aside className={styles.card} aria-label="Eckdaten auf einen Blick">
            <h2 className={styles.title}>Auf einen Blick</h2>

            {rows.length > 0 && (
                <dl className={styles.rows}>
                    {rows.map((r) => (
                        <div key={r.label} className={styles.row}>
                            <dt className={styles.term}><span className={styles.icon}>{r.icon}</span>{r.label}</dt>
                            <dd className={styles.value}>{r.value}</dd>
                        </div>
                    ))}
                </dl>
            )}

            {f.skills.length > 0 && (
                <div className={styles.block}>
                    <span className={styles.blockLabel}>Kern-Skills</span>
                    <ul className={styles.chips}>
                        {f.skills.map((s) => <li key={s} className={styles.chip}>{s}</li>)}
                    </ul>
                </div>
            )}

            {f.highlights.length > 0 && (
                <div className={styles.block}>
                    <span className={styles.blockLabel}>Besonderheiten</span>
                    <ul className={styles.highlights}>
                        {f.highlights.map((h) => <li key={h}>{h}</li>)}
                    </ul>
                </div>
            )}
        </aside>
        </div>
    );
}
