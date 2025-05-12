import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";

export default function ProStep7({data, onNext, onPrevious}) {
    const [selectedFeatures, setSelectedFeatures] = useState(data.features || []);
    const [isSelected, setIsSelected] = useState(true);

    const features = [
        { value: 'Kontaktformular', label: 'Kontaktformular', icon: '' },
        { value: 'Newsletter', label: 'Newsletter', icon: '' },
        { value: 'Bildergalerie', label: 'Bildergalerie', icon: '' },
        { value: 'Video', label: 'Video', icon: '' },
        { value: 'Maps', label: 'Maps', icon: '' },
        { value: 'Social Media', label: 'Social Media', icon: '' },
        { value: 'Blog / News', label: 'Blog / News', icon: '' },
        { value: 'Eventkalender / Kursplan', label: 'Eventkalender / Kursplan', icon: '' },
        { value: 'Konfigurator', label: 'Konfigurator', icon: '' },
        { value: 'Schutz gegen Hackerangriffe', label: 'Schutz gegen Hackerangriffe', icon: '' },
        { value: 'Mehrsprachigkeit', label: 'Mehrsprachigkeit', icon: '' },
        { value: 'Sonstige Features', label: 'Sonstige Features', icon: '' },
    ]

    const handleClick = (value) => {
        setIsSelected(true);
        if (selectedFeatures.includes(value)) {
            setSelectedFeatures((prev) => prev.filter((item) => item !== value));
        } else {
            setSelectedFeatures((prev) => [...prev, value]);
        }
    }

    const handleSubmit = () => {
        if (selectedFeatures.length > 0) {
            onNext({ features: selectedFeatures });
        } else {
            setIsSelected(false)
        }
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Welche zusätzlichen Funktionen sind gewünscht?
                        <span className={`${styles.confSubline}`}>Mehrfachauswahl ist möglich</span></h3>
                    {features.map((feature) => (
                        <button
                            key={feature.value}
                            className={`${styles.confBtn} ${selectedFeatures.includes(feature.value) ? styles.confActive : ''}`}
                            onClick={() => handleClick(feature.value)}
                        >
                            <span>{feature.label}</span>
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