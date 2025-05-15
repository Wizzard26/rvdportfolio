import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";


export default function ProStep12({data, onNext, onPrevious}) {
    const [budget, setBudget] = useState(data.budget || '');
    const [isSelected, setIsSelected] = useState(true);


    const budgets = [
        { value: 'Bis 1500 Euro', label: 'Bis 1500 Euro', icon: '' },
        { value: 'Bis 5000 Euro', label: 'Bis 5000 Euro', icon: '' },
        { value: 'Bis 10000 Euro', label: 'Bis 10000 Euro', icon: '' },
        { value: 'Bis 20000 Euro', label: 'Bis 20000 Euro', icon: '' },
        { value: 'Bis 30000 Euro', label: 'Bis 30000 Euro', icon: '' },
        { value: 'Sonstiges Budget', label: 'Sonstiges Budget', icon: '' },
    ]

    const handleSubmit = () => {
        if(!budget){
            setIsSelected(false)
            return false
        }

        onNext({ budget: budget });
    }

    const handleClick = (value) => {
        setBudget(value);
        setIsSelected(true);
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Welches Budget wurde für die Erstellung eingeplant?</h3>
                    {budgets.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => handleClick(item.value)}
                            className={`${styles.confBtn} ${
                                item.value === budget ? styles.confActive : ""
                            }`}
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