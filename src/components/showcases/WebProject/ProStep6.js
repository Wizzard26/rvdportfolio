import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";


export default function ProStep6({data, onNext, onPrevious}) {
    const [selectedContents, setSelectedContents] = useState(data.contents || []);
    const [isSelected, setIsSelected] = useState(true);

    const contents = [
        { value: 'Texte sind vorhanden', label: 'Texte sind vorhanden', icon: '' },
        { value: 'Bilder sind vorhanden', label: 'Bilder sind vorhanden', icon: '' },
        { value: 'Inhalte werden noch erstellt', label: 'Inhalte werden noch erstellt', icon: '' },
        { value: 'Ich benötige Unterstützung', label: 'Ich benötige Unterstützung', icon: '' },
    ]

    const handleClick = (value) => {
        setIsSelected(true);
        if (selectedContents.includes(value)) {
            setSelectedContents((prev) => prev.filter((item) => item !== value));
        } else {
            setSelectedContents((prev) => [...prev, value]);
        }
    }

    const handleSubmit = () => {
        if (selectedContents.length > 0) {
            onNext({ contents: selectedContents });
        } else {
            setIsSelected(false)
        }
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Wie steht es um den Inhalt / Content der Seite?
                        <span className={`${styles.confSubline}`}>Mehrfachauswahl ist möglich</span></h3>
                    {contents.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => handleClick(item.value)}
                            className={`${styles.confBtn} ${selectedContents.includes(item.value) ? styles.confActive : ''}`}
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