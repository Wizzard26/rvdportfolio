import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";

export default function ProStep4({data, onNext, onPrevious}) {
    const [selectedGoal, setSelectedGoal] = useState(data.goals || []);
    const [isSelected, setIsSelected] = useState(true);


    const goals = [
        { value: 'Neue oder andere Kunden gewinnen', label: 'Neue oder andere Kunden gewinnen', icon: '' },
        { value: 'Nach Empfehlungen mit dem zweiten Eindruck überzeugen', label: 'Nach Empfehlungen mit dem zweiten Eindruck überzeugen', icon: '' },
        { value: 'Auffindbarkeit und Sichtbarkeit verbessern', label: 'Auffindbarkeit und Sichtbarkeit verbessern', icon: '' },
        { value: 'Den Aussenauftritt auf die Weiterentwicklung anpassen', label: 'Den Aussenauftritt auf die Weiterentwicklung anpassen', icon: '' },
        { value: 'Webseite an neues Corporate Design anpassen', label: 'Webseite an neues Corporate Design anpassen', icon: '' },
        { value: 'Mitarbeiter, Partner oder Investoren gewinnen', label: 'Mitarbeiter, Partner oder Investoren gewinnen', icon: '' },
        { value: 'Kundenbindung und Service verbessern', label: 'Kundenbindung und Service verbessern', icon: '' },
        { value: 'Image verbessern', label: 'Image verbessern', icon: '' },
        { value: 'Markenaufbau oder Wettbewerbsintensivitaet verbessern', label: 'Markenaufbau oder Wettbewerbsintensivität verbessern', icon: '' },
        { value: 'Zeit und kosten sparen', label: 'Zeit und kosten sparen', icon: '' },
    ]

    const handleClick = (value) => {
        setIsSelected(true);
        if (selectedGoal.includes(value)) {
            setSelectedGoal((prev) => prev.filter((item) => item !== value));
        } else {
            setSelectedGoal((prev) => [...prev, value]);
        }
    }

    const handleSubmit = () => {
        if (selectedGoal.length > 0) {
            onNext({ goals: selectedGoal });
        } else {
            setIsSelected(false);
        }
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Welche Ziele verfolgen Sie mit der neuen Webseite?
                        <span className={`${styles.confSubline}`}>Mehrfachauswahl ist möglich</span></h3>
                    {goals.map((goal) => (
                        <button
                            key={goal.value}
                            onClick={() => handleClick(goal.value)}
                            className={`${styles.confBtn} ${selectedGoal.includes(goal.value) ? styles.confActive : ''}`}
                        >
                            {goal.icon}
                            {goal.label}
                        </button>
                    ))}
                    {!isSelected &&
                        <span className={`${styles.confError}`}>Bitte treffen Sie eine Auswahl</span>
                    }
                </div>
            </div>
            <div className={`${styles.confActions}`}>
                <button className={`${styles.confBtnPrev}`} onClick={onPrevious}><MdOutlineNavigateBefore/> Zurück
                </button>
                <button className={`${styles.confBtnNext}`} onClick={handleSubmit}>Weiter <MdOutlineNavigateNext/>
                </button>
            </div>
        </div>
    )
}