import { roboto } from '@/app/fonts';
import { FiActivity, FiZap, FiAward } from 'react-icons/fi';
import { getActivity } from '@/lib/activity';
import styles from './activity.module.css';

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

// Zählstufe → Farbklasse (0 bis 4), analog zur bekannten Contribution-Heatmap.
function level(count) {
    if (!count) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
}

// Aktivitäts-Bereich für /about-me (unter „Meine Kenntnisse"). Server-Component:
// rendert null, wenn keine Daten vorliegen (keine Tokens hinterlegt) — die Seite
// bleibt dann unverändert.
export default async function ActivitySection() {
    const data = await getActivity();
    if (!data) return null;

    const { weeks, stats } = data;

    return (
        <section className="secondary--bg">
            <div className="content-inner">
                <h2 className={`${roboto.className} is--centered`}>Entwickler-Aktivität</h2>
                <p className={styles.lead}>
                    Zusammengeführte Aktivität aus meinen Git-Accounts der letzten 12 Monate.
                </p>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <FiActivity aria-hidden="true" />
                        <span className={styles.statNum}>{stats.total.toLocaleString('de-DE')}</span>
                        <span className={styles.statLabel}>Beiträge (12 Monate)</span>
                    </div>
                    <div className={styles.stat}>
                        <FiZap aria-hidden="true" />
                        <span className={styles.statNum}>{stats.current}</span>
                        <span className={styles.statLabel}>Aktueller Streak (Tage)</span>
                    </div>
                    <div className={styles.stat}>
                        <FiAward aria-hidden="true" />
                        <span className={styles.statNum}>{stats.longest}</span>
                        <span className={styles.statLabel}>Längster Streak (Tage)</span>
                    </div>
                </div>

                <div className={styles.calendarWrap}>
                    <div className={styles.calendar} style={{ '--cols': weeks.length }}>
                        {/* Monatslabels je Wochenspalte */}
                        <div className={styles.months}>
                            {weeks.map((w, i) => {
                                const m = w[0].month;
                                const prev = i > 0 ? weeks[i - 1][0].month : -1;
                                return <span key={i}>{m !== prev ? MONTHS[m] : ''}</span>;
                            })}
                        </div>
                        {/* Zellenraster: 7 Zeilen (So–Sa), pro Woche eine Spalte */}
                        <div className={styles.grid}>
                            {weeks.map((week, wi) => (
                                week.map((day, di) => (
                                    day.count === null
                                        ? <span key={`${wi}-${di}`} className={styles.cellEmpty} />
                                        : <span
                                            key={`${wi}-${di}`}
                                            className={`${styles.cell} ${styles[`l${level(day.count)}`]}`}
                                            title={`${day.count} ${day.count === 1 ? 'Beitrag' : 'Beiträge'} am ${day.date}`}
                                        />
                                ))
                            ))}
                        </div>
                    </div>

                    <div className={styles.legend}>
                        <span className={styles.scale}>
                            Weniger
                            <span className={`${styles.cell} ${styles.l0}`} />
                            <span className={`${styles.cell} ${styles.l1}`} />
                            <span className={`${styles.cell} ${styles.l2}`} />
                            <span className={`${styles.cell} ${styles.l3}`} />
                            <span className={`${styles.cell} ${styles.l4}`} />
                            Mehr
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
