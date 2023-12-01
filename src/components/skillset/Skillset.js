import { skillSet } from "@/lib/skillset";
import styles from "@/components/skillset/styles.module.css";

const getLevel = (percent) => {
    if (percent <= 45) {
        return 'Beginner';
    } else if (percent <= 80) {
        return 'Intermediant';
    } else {
        return 'Expert'
    }
}

export default function Skillset() {
    return (
        <>
            <div className={`${styles.progressRow}`}>
                {
                    skillSet.map((skill) => (
                        <div key={skill.id} className={`${styles.progressBar} ${styles[getLevel(skill.percentage)]}`} style={{'--percentage': `${skill.percentage}%`}}><span>{skill.name}</span></div>
                    ))
                }
                <div className={`${styles.levels}`}>
                    <div className={`${styles.levelNoob}`}><span></span>Beginner</div>
                    <div className={`${styles.levelIntermediant}`}><span></span>Intermediant</div>
                    <div className={`${styles.levelExpert}`}><span></span>Expert</div>
                </div>
            </div>
        </>
    );
}