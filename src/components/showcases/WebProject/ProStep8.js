import { useState } from "react";
import styles from "./styles.module.css";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md";

export default function ProStep8({data, onNext, onPrevious}) {
    const [optionalFeatures, setOptionalFeatures] = useState(data.optionalFeatures || '');
    const [isSelected, setIsSelected] = useState(true);

    const handleSubmit = () => {
        onNext({optionalFeatures: optionalFeatures});
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Sie haben weitere Anforderungen oder Funktionswünsche? <br/>Hier haben Sie die Möglichkeit diese einzutragen oder zu beschreiben.
                        </h3>
                    <textarea
                        placeholder="Hier können Sie weiter benötigte Features eingeben"
                        value={optionalFeatures}
                        className={`${styles.confTextArea}`}
                        onChange={(e) => setOptionalFeatures(e.target.value)}/>
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