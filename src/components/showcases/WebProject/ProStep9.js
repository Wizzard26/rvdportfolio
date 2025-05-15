import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";

export default function ProStep9({data, onNext, onPrevious}) {
    const [selectedLayout, setSelectedLayout] = useState(data.layout || '');
    const [isSelected, setIsSelected] = useState(true);

    const layouts = [
        { value: 'Minimale Anpassung an Corporate Design', label: 'Minimale Anpassung an Corporate Design', icon: '' },
        { value: 'Design vorhanden', label: 'Design vorhanden', icon: '' },
        { value: 'Design wird erstellt', label: 'Design wird erstellt', icon: '' },
        { value: 'Ich benötige Unterstützung', label: 'Ich benötige Unterstützung', icon: '' },
    ]

    const handleClick = (value) => {
        setSelectedLayout(value);
        setIsSelected(true);
    }

    const handleSubmit = () => {
        if (selectedLayout) {
            onNext({ layout: selectedLayout });
        } else {
            setIsSelected(false);
        }
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Haben Sie schon ein Layout oder Corporate Design?</h3>
                    {layouts.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => handleClick(item.value)}
                            className={`${styles.confBtn} ${selectedLayout === item.value ? styles.confActive : ''}`}
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