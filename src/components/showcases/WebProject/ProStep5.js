import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";


export default function ProStep5({data, onNext, onPrevious}) {
    const [selectedPages, setSelectedPages] = useState(data.pages || '');
    const [isSelected, setIsSelected] = useState(true);

    const pages = [
        { value: 'Onepager / Landingpage', label: 'Onepager / Landingpage', icon: '' },
        { value: 'Bis zu Fünf Seiten', label: 'Bis zu Fünf Seiten', icon: '' },
        { value: 'Bis zu Zehn Seiten', label: 'Bis zu Zehn Seiten', icon: ''},
        { value: 'Bis zu zwanzig Seiten', label: 'Bis zu zwanzig Seiten', icon: ''},
        { value: 'Mehr als zwanzig Seiten', label: 'Mehr als zwanzig Seiten', icon: ''},
        { value: 'Noch Unsicher über die Seitenanzahl', label: 'Noch Unsicher über die Seitenanzahl', icon: ''},
    ];

    const handleClick = (value) => {
        setSelectedPages(value);
        setIsSelected(true);
    }

    const handleSubmit = () => {
        if (selectedPages) {
            onNext({pages: selectedPages})
        } else {
            setIsSelected(false);
        }
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Wieviele Seiten und Unterseiten sind geplant?
                        <span className={`${styles.confSubline}`}>Seiten sind z.B. wie folgdende: Startseite, Leistung, Über uns, Referenzen, Kontakt, Anmeldeseiten,... Rechtliche Seiten, wie beispielsweise Datenschutz und Impressum werden nicht mitgezählt. </span></h3>

                    {pages.map((page) => (
                        <button
                            key={page.value}
                            onClick={() => handleClick(page.value)}
                            className={`${styles.confBtn} ${selectedPages === page.value ? styles.confActive : ''}`}
                        >
                            {page.icon}
                            {page.label}
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