import HeroContent from "@/components/herocontent/page";
import { getStations } from "@/lib/content/vitaStore";
import { getAreasWithEntries } from "@/lib/content/vitaPersonalStore";
import { getVitaDocument } from "@/lib/content/documentsStore";
import styles from "./styles.module.css";
import {ranga, roboto_condensed} from "@/app/fonts";
import Button from "@/components/button/Button";
import {Fragment} from "react";
import { MotionDiv } from "@/components/MotionDiv/MotionDiv";
import { TbFileTypePdf } from "react-icons/tb";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, careerSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
    title: 'Vita & beruflicher Werdegang',
    description:
        'Der Werdegang von René van Dinter: Stationen vom Mediengestalter über Frontend und Teamleitung bis zur Shopware-6-Entwicklung. Zeugnisse und Zertifikate.',
    path: '/vita',
});

// Die Stationen kommen jetzt aus der Content-DB (im Admin pflegbar). Deshalb pro
// Request rendern — die Server-DB (Volume) existiert erst zur Laufzeit, ein
// Build-Prerender würde sie nicht sehen.
export const dynamic = 'force-dynamic';

const variants = {
    hidden: { opacity:0 },
    visible: { opacity: 1 },
};

export default async function Vita() {
    const pageName = "Vita";
    const data = getStations({ publicOnly: true }); // bereits neueste zuerst, nur aktive
    const vitaDoc = getVitaDocument(); // im Admin gewähltes Vita-Download-PDF
    const personal = getAreasWithEntries(); // Sidebar-Bereiche aus der DB
    const yearNow = new Date().getFullYear();
    const monthNow = new Date().getMonth();

    return(
        <>
            <JsonLd data={[
                careerSchema(data),
                breadcrumbSchema([{ name: 'Vita', path: '/vita' }]),
            ]} />
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
                                            {vita.start} - {vita.is_current
                                            ? (monthNow + 1) + '/' + yearNow
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
                            {personal.map(area => (
                                <Fragment key={area.id}>
                                    {Boolean(area.show_headline) && area.title &&
                                        <h3 className={`${ranga.className}`}>{area.title}</h3>
                                    }
                                    <p>
                                        {area.entries.map(entry => (
                                            <Fragment key={entry.id}>
                                                {entry.link
                                                    ? <><a href={entry.link} title={entry.text} download={entry.text}><TbFileTypePdf /> {entry.text}</a><br/></>
                                                    : <>{entry.text}<br/></>
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
                                href={vitaDoc?.file || "/document/Vita.pdf"}
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