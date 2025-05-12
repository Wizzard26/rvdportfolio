import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";


export default function ProStep3({data, onNext, onPrevious}) {
    const [selectedProperties, setSelectedProperties] = useState(data.properties || []);
    const [isSelected, setIsSelected] = useState(true);

    const properties = [
        { value: 'Modernes Design', label: 'Modernes Design', icon: '' },
        { value: 'Mobile Optimierung', label: 'Mobile Optimierung', icon: '' },
        { value: 'Google Optimierung', label: 'Google Optimierung ( SEO )', icon: '' },
        { value: 'Technische Optimierung', label: 'Technische Optimierung', icon: '' },
        { value: 'Pflege der Webseite', label: 'Pflege der Webseite', icon: '' },
        { value: 'Social Media Verlinkungen', label: 'Social Media Verlinkungen', icon: '' },
        { value: 'Digitale Prozesse Integration', label: 'Digitale Prozesse Integration', icon: '' },
        { value: 'Mitarbeiter anwerben', label: 'Mitarbeiter anwerben', icon: '' },
        { value: 'Kundenanfragen generieren', label: 'Kundenanfragen generieren', icon: '' },
    ]


    const handleClick = (value) => {
        setIsSelected(true);
        if (selectedProperties.includes(value)) {
            setSelectedProperties((prev) => prev.filter((item) => item !== value));
        } else {
            setSelectedProperties((prev) => [...prev, value]);
        }
    }


    const handleSubmit = () => {
        if (selectedProperties.length > 0) {
            onNext({ properties: selectedProperties });
        } else {
            setIsSelected(false);
        }
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Worauf soll bei der Erstellung besonderes Augenmerk gelegt werden?
                    <span className={`${styles.confSubline}`}>Mehrfachauswahl ist möglich</span></h3>
                    {properties.map((property) => (
                        <button
                            key={property.value}
                            onClick={() => handleClick(property.value)}
                            className={`${styles.confBtn} ${selectedProperties.includes(property.value) ? styles.confActive : ''}`}
                        >
                            {property.label}
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
    );
}