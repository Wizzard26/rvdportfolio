import {useState} from "react";
import styles from "./styles.module.css";
import { MdOutlineUpdate, MdHttp, MdDesignServices, MdOutlineNavigateNext} from "react-icons/md";

export default function ProStep1({data, onNext}) {
    const [selectedProject, setSelectedProject] = useState(data.project || '');
    const [projectUrl, setProjectUrl] = useState(data.webpage || '');
    const [isFormValid, setIsFormValid] = useState(true);
    const [isSelected, setIsSelected] = useState(true);

    const projectOptions = [
        { value: 'Neuerstellung', label: 'Neuerstellung', icon: <MdDesignServices /> },
        { value: 'Relaunch eines bestehenden Projekts', label: 'Relaunch eines bestehenden Projekts', icon: <MdOutlineUpdate /> },
    ]


    const validateForm = () => {
        if (selectedProject === 'Relaunch eines bestehenden Projekts' && !projectUrl) {
            setIsFormValid(false);
            return false;
        }

        if (!selectedProject){
            setIsSelected(false);
            return false;
        }

        setIsFormValid(true);
        setIsSelected(true);
        return true;
    };

    const handleClick = (value) => {
        setSelectedProject(value);
        setIsFormValid(true);
        setIsSelected(true);
    }

    const handleUrlChange = (e) => {
        setProjectUrl(e.target.value);
        if (selectedProject === "Relaunch eines bestehenden Projekts") {
            setIsFormValid(!!e.target.value); // Immediate validation
        }
    };

    const handleSubmit = () => {
        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        onNext({
            project: selectedProject,
            webpage: selectedProject === 'Relaunch eines bestehenden Projekts'
                ? projectUrl
                : ''
        });
    }

    return (
        <div>
            <div className={`${styles.confCard}`}>
                <div className={`${styles.confCardInner}`}>
                    <h3 className={`${styles.confHeadline}`}>Haben Sie schon eine Webseite?</h3>
                    {projectOptions.map((project) => (
                        <button
                            key={project.value}
                            onClick={() => handleClick(project.value)}
                            className={`${styles.confBtn} ${selectedProject === project.value ? styles.confActive : ''}`}
                        >
                            <span className={`${styles.confIcon}`}>
                                {project.icon}
                            </span>
                                <span className={`${styles.confTitle}`}>
                                {project.label}
                            </span>
                        </button>
                    ))}
                    <div
                        className={`${styles.confInput} ${styles.confInputUrl} ${selectedProject === 'Relaunch eines bestehenden Projekts' ? styles.confInputActive : ''}`}>
                        {selectedProject === 'Relaunch eines bestehenden Projekts' && (
                            <>
                            <span className={`${styles.confIcon}`}>
                                <MdHttp/>
                            </span>
                                <input
                                    className={`${styles.confTextInput}`}
                                    type="text"
                                    placeholder="Wie lautet die Url der Seite?"
                                    value={projectUrl}
                                    onChange={handleUrlChange}
                                />
                                {!isFormValid &&
                                    <span className={`${styles.confError}`}>Bitte geben Sie eine gültige URL ein!</span>
                                }
                            </>
                        )}
                        {!isSelected &&
                            <span className={`${styles.confError}`}>Bitte treffen Sie eine Auswahl</span>
                        }
                    </div>

                </div>
            </div>
            <div className={`${styles.confActions}`}>
                <button className={`${styles.confBtnNext}`} onClick={handleSubmit}>Weiter <MdOutlineNavigateNext /></button>
            </div>
        </div>
    );
}