import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";

export default function ProStep13({data, onNext, onPrevious}) {
    const [contact, setContact] = useState(data.contact || {});
    const [isFormValid, setIsFormValid] = useState(true);

    const validateForm = () => {
        if (!contact.name || !contact.lastname || !contact.email || contact.gender === 'keine auswahl') {
            setIsFormValid(false);
            return false;
        }

        setIsFormValid(true);
        return true;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContact({ ...contact, [name]: value });
    }
    const handleSubmit = () => {
        const isValid = validateForm();

        if (!isValid){
            return;
        }

        onNext({ contact: contact });
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Danke für Ihre Angaben, bitte füllen Sie das folgende Formular mit den Notwendigen Kontaktdaten aus.
                        <span className={`${styles.confSubline}`}>Auf der folgenden Seite erhalten Sie nochmal eine Übersicht aller Angaben.</span></h3>
                    <div className={`${styles.confFormRow}`}>
                        <div className={`${styles.confFormCol}`}>
                            <label>Anrede: <sup>*</sup></label>
                            <select
                                className={`${styles.confInputSelect}`}
                                value={contact.gender}
                                defaultValue="Bitte auswählen"
                                name="gender"
                                onChange={handleChange}
                            >
                                <option value="keine auswahl">Bitte auswählen</option>
                                <option value="Herr">Herr</option>
                                <option value="Frau">Frau</option>
                                <option value="Diverse">Diverse</option>
                            </select>
                        </div>
                        <div className={`${styles.confFormCol}`}>
                            <label>Titel:</label>
                            <input
                                className={`${styles.confInputText}`}
                                type="text"
                                name="title"
                                value={contact.title}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className={`${styles.confFormRow}`}>
                        <div className={`${styles.confFormCol}`}>
                            <label>Vorname: <sup>*</sup></label>
                            <input
                                className={`${styles.confInputText}`}
                                type="text"
                                name="name"
                                value={contact.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={`${styles.confFormCol}`}>
                            <label>Nachname: <sup>*</sup></label>
                            <input
                                className={`${styles.confInputText}`}
                                type="text"
                                name="lastname"
                                value={contact.lastname}
                                onChange={handleChange}/>
                        </div>
                    </div>

                    <div className={`${styles.confFormRow}`}>
                        <div className={`${styles.confFormCol}`}>
                            <label>Firma:</label>
                            <input
                                className={`${styles.confInputText}`}
                                type="text"
                                name="company"
                                value={contact.company}
                                onChange={handleChange}/>
                        </div>
                        <div className={`${styles.confFormCol}`}>
                            <label>Position:</label>
                            <input
                                className={`${styles.confInputText}`}
                                type="text"
                                name="position"
                                value={contact.position}
                                onChange={handleChange}/>
                        </div>
                    </div>

                    <div className={`${styles.confFormRow}`}>
                        <div className={`${styles.confFormCol}`}>
                            <label>E-Mail: <sup>*</sup></label>
                            <input
                                className={`${styles.confInputText}`}
                                type="email"
                                name="email"
                                value={contact.email}
                                onChange={handleChange}/>
                        </div>
                        <div className={`${styles.confFormCol}`}>
                            <label>Telefon:</label>
                            <input
                                className={`${styles.confInputText}`}
                                type="tel"
                                name="phone"
                                value={contact.phone}
                                onChange={handleChange}/>
                        </div>
                    </div>

                    {!isFormValid &&
                        <span className={`${styles.confError}`}>Bitte füllen Sie die Pflichtfelder aus!</span>
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