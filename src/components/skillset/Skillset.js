import {skillSet} from "@/lib/skillset";
import styles from "@/components/skillset/styles.module.css";

export default function Skillset() {
    return (
        <>
            <div className={`${styles.progressRow}`}>
                {
                    skillSet.map((skill) => (
                        <div key={skill.id} className={`${styles.progressBar} ${styles[skill.level]}`} style={{'--percentage': `${skill.percentage}%`}}><span>{skill.name}</span></div>
                    ))
                }
                <div className={`${styles.levels}`}>
                    <div className={`${styles.levelNoob}`}><span></span>Beginner</div>
                    <div className={`${styles.levelIntermediant}`}><span></span>Intermedian</div>
                    <div className={`${styles.levelExpert}`}><span></span>Experte</div>
                </div>
            </div>
        </>
    );
}