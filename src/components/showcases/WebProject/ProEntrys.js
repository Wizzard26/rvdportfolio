import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";


export default function ProEntrys({data, onNext, onPrevious}) {

    const handleSubmit = (e) => {
        onNext(e, data);
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Bitte prüfen Sie hier Ihre gemachten Angaben!<br/>Wenn die Angaben alle korrekt sind, können Sie die Anfrage absenden.<br/>Sie erhalten dann umgehend eine Antwort auf Ihre Anfrage.</h3>
                    <h3 className={`${styles.confTitleHeadline}`}>Anforderungen zum Projekt</h3>
                    <div className={`${styles.confTable}`}>
                        <div className={`${styles.confTableRow}`}>
                            <span>Art des Projekts: </span>
                            <span>{data.project}</span>
                        </div>
                        {data.webpage &&
                            <div className={`${styles.confTableRow}`}>
                                <span>Webseite: </span>
                                <span>{data.webpage}</span>
                            </div>
                        }
                        <div className={`${styles.confTableRow}`}>
                            <span>Thema: </span>
                            <span>{data.business}</span>
                        </div>
                        <div className={`${styles.confTableRow}`}>
                            <span>Eigenschaften: </span>
                            <span>
                                {data.properties.map((item, index) => (
                                    <span key={index}>{item}</span>
                                ))}
                            </span>
                        </div>
                        <div className={`${styles.confTableRow}`}>
                            <span>Zielsetzung: </span>
                            <span>
                                {data.goals.map((item, index) => (
                                    <span key={index}>{item}</span>
                                ))}
                            </span>
                        </div>
                        <div className={`${styles.confTableRow}`}>
                            <span>Anzahl der Seiten: </span>
                            <span>{data.pages}</span>
                        </div>
                        <div className={`${styles.confTableRow}`}>
                            <span>Inhalte: </span>
                            <span>
                                {data.contents.map((item, index) => (
                                    <span key={index}>{item}</span>
                                ))}
                            </span>
                        </div>
                        <div className={`${styles.confTableRow}`}>
                            <span>Erweiterungen: </span>
                            <span>
                                {data.features.map((item, index) => (
                                    <span key={index}>{item}</span>
                                ))}
                            </span>
                        </div>
                        {data.optionalFeatures &&
                            <div className={`${styles.confTableRow}`}>
                                <span>Optionale Erweiterungen: </span>
                                <span>{data.optionalFeatures}</span>
                            </div>
                        }
                        <div className={`${styles.confTableRow}`}>
                            <span>Design: </span>
                            <span>{data.layout}</span>
                        </div>
                        <div className={`${styles.confTableRow}`}>
                            <span>Bearbeitung: </span>
                            <span>{data.contentEdit}</span>
                        </div>
                        <div className={`${styles.confTableRow}`}>
                            <span>Fertigstellung: </span>
                            <span>{data.deadline}</span>
                        </div>
                        <div className={`${styles.confTableRow}`}>
                            <span>Budget: </span>
                            <span>{data.budget}</span>
                        </div>
                    </div>

                    <h3 className={`${styles.confTitleHeadline}`}>Ansprechpartner und Kontaktdaten</h3>

                    <div className={`${styles.confTable}`}>
                        <div className={`${styles.confTableRow}`}>
                            <span>Anrede: </span>
                            <span>{data.contact.gender}</span>
                        </div>
                        {data.contact.title &&
                            <div className={`${styles.confTableRow}`}>
                                <span>Titel: </span>
                                <span>{data.contact.title}</span>
                            </div>
                        }
                        <div className={`${styles.confTableRow}`}>
                            <span>Ansprechpartner: </span>
                            <span>{data.contact.name} {data.contact.lastname}</span>
                        </div>
                        {data.contact.company &&
                            <>
                                <div className={`${styles.confTableRow}`}>
                                    <span>Firma: </span>
                                    <span>{data.contact.company}</span>
                                </div>
                                <div className={`${styles.confTableRow}`}>
                                    <span>Position: </span>
                                    <span>{data.contact.position}</span>
                                </div>
                            </>
                        }
                        <div className={`${styles.confTableRow}`}>
                            <span>E-Mail: </span>
                            <span>{data.contact.email}</span>
                        </div>
                        <div className={`${styles.confTableRow}`}>
                            <span>Telefon: </span>
                            <span>{data.contact.phone}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`${styles.confActions}`}>
                <button className={`${styles.confBtnPrev}`} onClick={onPrevious}><MdOutlineNavigateBefore/> Zurück
                </button>
                <button className={`${styles.confBtnNext}`} onClick={handleSubmit}>Anfrage Absenden <MdOutlineNavigateNext/>
                </button>
            </div>
        </div>
    )
}