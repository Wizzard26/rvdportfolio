"use client";
import { skillSet } from "@/lib/skillset";
import styles from "@/components/skillset/styles.module.css";
import { motion } from "framer-motion";

const getLevel = (percent) => {
    if (percent <= 50) {
        return 'Beginner';
    } else if (percent <= 80) {
        return 'Intermediant';
    } else {
        return 'Expert'
    }
}

export default function Skillset({limit}) {
    const skillLimit = limit ? limit : skillSet.length;
    return (
        <div className={`${styles.progressRow}`}>
            {
                skillSet.slice(0, skillLimit).map((skill) => (
                    <div
                        key={skill.id}
                        className={`${styles.progressBar} ${styles[getLevel(skill.percentage)]}`}
                    >
                        <motion.div className={`${styles.progressBarInner}`}
                                    initial={{width: '0%'}}
                                    whileInView={{ width: `${skill.percentage}%` }}
                                    //exit={{width: '0%'}}
                                    transition={{
                                        delay: .5,
                                        ease: "easeIn",
                                        duration: .5
                                    }}
                                    viewport={{ once: true}}
                        >
                        </motion.div>
                        <span>{skill.name}</span>
                    </div>
                ))
            }
            <div className={`${styles.levels}`}>
                <div className={`${styles.levelNoob}`}><span></span>Beginner</div>
                <div className={`${styles.levelIntermediant}`}><span></span>Intermediant</div>
                <div className={`${styles.levelExpert}`}><span></span>Expert</div>
            </div>
        </div>
    );
}