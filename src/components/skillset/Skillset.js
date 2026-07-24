"use client";
import { skillSet } from "@/lib/skillset";
import styles from "@/components/skillset/styles.module.css";
import { useInView } from "@/components/reveal/useInView";

const getLevel = (percent) => {
    if (percent <= 50) {
        return 'Beginner';
    } else if (percent <= 80) {
        return 'Intermediate';
    } else {
        return 'Expert'
    }
}

export default function Skillset({limit}) {
    const skillLimit = limit ? limit : skillSet.length;
    // Ein Observer für die ganze Reihe: Sobald sie sichtbar wird, füllen sich
    // die Balken (CSS-Transition). Ohne JS stehen sie direkt auf ihrem Wert.
    const [ref, inView] = useInView();
    return (
        <div ref={ref} className={`${styles.progressRow}${inView ? ' ' + styles.inView : ''}`}>
            {
                skillSet.slice(0, skillLimit).map((skill) => (
                    <div
                        key={skill.id}
                        className={`${styles.progressBar} ${styles[getLevel(skill.percentage)]}`}
                    >
                        <span
                            className={`${styles.progressBarInner}`}
                            style={{ '--skill-width': `${skill.percentage}%` }}
                            aria-hidden="true"
                        ></span>
                        <span>{skill.name}</span>
                    </div>
                ))
            }
            <div className={`${styles.levels}`}>
                <div className={`${styles.levelNoob}`}><span></span>Beginner</div>
                <div className={`${styles.levelIntermediate}`}><span></span>Intermediate</div>
                <div className={`${styles.levelExpert}`}><span></span>Expert</div>
            </div>
        </div>
    );
}
