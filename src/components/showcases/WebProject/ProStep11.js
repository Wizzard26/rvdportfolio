import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";

export default function ProStep11({data, onNext, onPrevious}) {
    const [selectedDeadline, setSelectedDeadline] = useState(data.deadline || '');
    const [isSelected, setIsSelected] = useState(true);

    const deadlines = [
        { value: 'So Schnell wie möglich', label: 'So Schnell wie möglich', icon: '' },
        { value: 'In einem Monat', label: 'In einem Monat', icon: '' },
        { value: 'Innerhalb von 6 Monaten', label: 'Innerhalb von 6 Monaten', icon: '' },
        { value: 'Innerhalb von 12 Monaten', label: 'Innerhalb von 12 Monaten', icon: '' },
        { value: 'Zeitraum noch nicht festgelegt', label: 'Zeitraum noch nicht festgelegt', icon: '' },
    ]

    const handleClick = (value) => {
        setSelectedDeadline(value);
        setIsSelected(true);
    }

    const handleSubmit = () => {
        if (selectedDeadline) {
            onNext({ deadline: selectedDeadline });
        } else {
            setIsSelected(false)
        }
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Welcher Zeitrahmen ist für die Livestellung der Webseite geplant?</h3>
                    {deadlines.map((item) => (
                        <button
                            key={item.value}
                            className={`${styles.confBtn} ${selectedDeadline === item.value ? styles.confActive : ''}`}
                            onClick={() => handleClick(item.value)}
                        >
                            {item.label}
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