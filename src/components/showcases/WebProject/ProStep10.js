import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";

export default function ProStep10({data, onNext, onPrevious}) {
    const [selectedContentEdit, setSelectedContentEdit] = useState(data.contentEdit || '');
    const [isSelected, setIsSelected] = useState(true);

    const contentEdits = [
        { value: 'Die Inhalte sollen von uns Aktualisiert werden', label: 'Die Inhalte sollen von uns Aktualisiert werden', icon: '' },
        { value: 'Die Inhalte sollen von Ihnen Aktualisiert werden und die Seite technisch gewartet werden', label: 'Die Inhalte sollen von Ihnen Aktualisiert werden und die Seite technisch gewartet werden', icon: '' },
        { value: 'An der Seite soll nichts geändert oder aktualisiert werden', label: 'An der Seite soll nichts geändert oder aktualisiert werden', icon: '' },
    ]

    const handleClick = (value) => {
        setSelectedContentEdit(value);
        setIsSelected(true);
    }

    const handleSubmit = () => {
        if (selectedContentEdit) {
            onNext({ contentEdit: selectedContentEdit });
        } else {
            setIsSelected(false);
        }
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Wer soll sich um Aktualisierungen und Wartung kümmern?</h3>
                    {contentEdits.map((item) => (
                        <button
                            key={item.value}
                            className={`${styles.confBtn} ${selectedContentEdit === item.value ? styles.confActive : ''}`}
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