import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";

export default function ProStep2({data, onNext, onPrevious}) {
    const [selectedBusiness, setSelectedBusiness] = useState(data.business || '');
    const [isSelected, setIsSelected] = useState(true);

    const baseBusiness = [
        { value: 'Arzt / Praxis / Gesundheitswesen', label: 'Arzt / Praxis / Gesundheitswesen', icon: ''},
        { value: 'Steuerberater / Finanzen', label: 'Steuerberater / Finanzen', icon: ''},
        { value: 'Rechtsanwalt / Kanzlei', label: 'Rechtsanwalt / Kanzlei', icon: ''},
        { value: 'Blog / News', label: 'Blog / News', icon: ''},
        { value: 'Verein / Allgemein', label: 'Verein / Allgemeinnützig', icon: ''},
        { value: 'Einzelhandel / Stationärer Handel', label: 'Einzelhandel / Stationärer Handel', icon: ''},
        { value: 'Handwerker / Dienstleister', label: 'Handwerker / Dienstleister', icon: ''},
        { value: 'Gastronomie / Essen / Trinken', label: 'Gastronomie / Essen / Trinken', icon: ''},
        { value: 'Hotel / BnB / Pension', label: 'Hotel / BnB / Pension', icon: ''},
        { value: 'Ferienwohnung / Camping', label: 'Ferienwohnung / Camping', icon: ''},
        { value: 'Immobilien', label: 'Immobilien', icon: ''},
        { value: 'Friseur / Kosmetik', label: 'Friseur / Kosmetik', icon: ''},
        { value: 'Auto / Motorrad', label: 'Auto / Motorrad', icon: ''},
        { value: 'Reise / Tourismus', label: 'Reise / Tourismus', icon: ''},
        { value: 'Versicherungen', label: 'Versicherungen', icon: ''},
        { value: 'Wissenschaft / Forschung', label: 'Wissenschaft / Forschung', icon: ''},
        { value: 'E-Commerce', label: 'E-Commerce', icon: ''},
        { value: 'Sonstiges', label: 'Sonstige Branche', icon: ''},
    ]

    const handleClick = (value) => {
        setIsSelected(true);
        setSelectedBusiness(value);
    }

    const handleSubmit = () => {
        if (!selectedBusiness) {
            setIsSelected(false);
            return false
        }

        onNext({ business: selectedBusiness });
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Welche Thema wird auf Ihrer Seite behandelt?</h3>
                    {baseBusiness.map((business) => (
                        <button
                            key={business.value}
                            onClick={() => handleClick(business.value)}
                            className={`${styles.confBtn} ${selectedBusiness === business.value ? styles.confActive : ''}`}
                        >
                            <span className={`${styles.confTitle}`}>
                                {business.label}
                            </span>
                        </button>
                    ))}
                    {!isSelected &&
                        <span className={`${styles.confError}`}>Bitte treffen Sie eine Auswahl</span>
                    }
                </div>
            </div>
            <div className={`${styles.confActions}`}>
            <button className={`${styles.confBtnPrev}`} onClick={onPrevious}><MdOutlineNavigateBefore /> Zurück</button>
                <button className={`${styles.confBtnNext}`} onClick={handleSubmit}>Weiter <MdOutlineNavigateNext /></button>
            </div>
        </div>
    )
}