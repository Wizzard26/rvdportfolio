import HeroContent from "@/components/herocontent/page";
import { vitaEntries, vitaPersonal } from "@/lib/vita";
import styles from "./styles.module.css";
import {ranga, roboto_condensed} from "@/app/fonts";
import Button from "@/components/button/Button";
import {Fragment} from "react";
import { MotionDiv } from "@/components/MotionDiv/MotionDiv";
import { SiAdobeacrobatreader } from "react-icons/si";

function getWorkStations() {
    const vitaStation = vitaEntries;
    const entries = [...vitaStation].reverse();
    return entries;
}

const variants = {
    hidden: { opacity:0 },
    visible: { opacity: 1 },
};

export default function Vita() {
    const pageName = "Vita";
    const data = getWorkStations();
    const yearNow = new Date().getFullYear();
    const monthNow = new Date().getMonth();

    return(
        <>
            <HeroContent
                className={`hero-container`}
                pageName={pageName}
                imgPos="top"
                txtPos="left"
            />
            <main className="main-content">
                <div className="content-inner">
                    <h1>Beruflicher Werdegang, Stationen und Positionen</h1>
                    <div className={`row`}>
                        <div className={`col-12 col-lg-8 col-xl-9`}>
                            {data.map(vita => (
                                <MotionDiv
                                    variants={variants}
                                    initial="hidden"
                                    whileInView="visible"
                                    exit="hidden"
                                    transition={{
                                        delay: 0.5,
                                        ease: "easeInOut",
                                        duration: 0.5,
                                    }}
                                    viewport={{ once: true }}
                                    className={`${styles.vitaEntry}`}
                                    key={vita.id}>
                                    <div className={`${styles.vitaHeadline}`}>
                                        <h2 className={`${roboto_condensed.className} ${styles.vitaTitle} col-12 col-xl-9`}>{vita.title}</h2>
                                        <div className={`${styles.vitaStateDate} ${roboto_condensed.className} col-12 col-xl-3`}>
                                            {vita.start} - {vita.end == 'Now'
                                            ? monthNow + '/' + yearNow
                                            : vita.end
                                        }
                                        </div>
                                    </div>
                                    <div className={`${styles.vitaContent} col-12 col-xl-9`}>
                                        <h3 className={`${ranga.className} ${styles.vitaCompany}`}>{vita.company}</h3>
                                        <p>{vita.description}</p>
                                    </div>
                                </MotionDiv>
                            ))}
                        </div>
                        <div className={`${styles.vitaSidebar} secondary--bg col-12 col-lg-4 col-xl-3`}>
                            <h2>Persönliche Daten:</h2>
                            {vitaPersonal.map(personal => (
                                <Fragment key={personal.id}>
                                    {personal.showheadline &&
                                        <h3 className={`${ranga.className}`}>{personal.area}</h3>
                                    }
                                    <p>
                                        {personal.entries.map(entries => (
                                            <Fragment key={entries.id}>
                                                {entries.link
                                                    ? <><a href={entries.link} title={entries.entry} download={entries.entry}><SiAdobeacrobatreader /> {entries.entry}</a><br/></>
                                                    : <>{entries.entry}<br/></>
                                                }
                                            </Fragment>
                                        ))}
                                    </p>
                                </Fragment>
                            ))}
                        </div>
                    </div>
                    <div className={`${styles.vitaActions} row`}>
                        <div className="col-12 col-md-6 align-center align-md-right">
                            <Button
                                href="/document/Vita.pdf"
                                title="Rene-van-Dinter-Vita"
                                style="primary"
                                text="Vita als Download"
                                isDownload={true}
                            />
                        </div>
                        <div className="col-12 col-md-6 align-center align-md-left">
                            <Button
                                href="/contact"
                                title="Schreiben Sie Mir"
                                style="secondary-full"
                                text="Kontaktieren Sie mich"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}