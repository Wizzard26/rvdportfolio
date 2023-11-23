import HeroContent from "@/components/herocontent/page";
import Teaser from "@/components/teaser/page";
import { getQuoteData } from "@/utils/getQuoteData";
import dynamic from 'next/dynamic';
import {ranga, roboto} from "@/app/fonts";
import styles from "./styles.module.css";
import Button from "@/components/button/Button";
import Skillset from "@/components/skillset/Skillset";

const Blockqoutes = dynamic(() => import('@/components/blockqoutes/page'), {
    ssr: false,
    loading: () => <section><div className="content-inner"><blockquote style={{ textAlign: 'center' }}>Loading random quote ...</blockquote></div></section>
})

export default async function AboutMe() {
    const pageName = "AboutMe";
    //const { author, quote } = await getQuoteData();
    const quoteData = await getQuoteData();

    return (
        <>
            <HeroContent
                className={`hero-container`}
                pageName={pageName}
                imgPos="top"
            />
            <Teaser
                className="main--teaser"
                pageName={pageName}
            />
            <Blockqoutes quoteData={quoteData}  />
            <section className="secondary--bg">
                <div className="content-inner">
                    <h2 className={`${roboto.className} is--centered`}>Meine Kenntnisse</h2>
                    <div className={'row'}>
                        <div className={`col-12 col-md-6`}>
                            <h2 className={roboto.className}>Erworbene Fähigkeiten</h2>
                            <Skillset />
                        </div>
                        <div className={'col-12 col-md-6'}>
                            <h2 className={roboto.className}>Das Gestalterische und Digitale Credo</h2>
                            <h3 className={ranga.className}><span className={styles.inQoute}>Lebenslanges lernen</span> Ein nie enden wollender Prozess</h3>
                            <p>Gerade in der Digitalen und Kreativen Welt ist das Lernen und weiterbilden wichtiger als in kaum einen anderen Beruf. Durch die dauernden änderungen von Standards, Trends und Techniken ist das was gestern noch Hipp war, morgen vieleicht schon wieder Flopp.
                                Die Werbung sowie auch die Digitale Welt, das World Wide Web, befinden sich stetig im Wandel und der Weiterentwicklung. Neue Erkenntnisse über nutzerverhalten, angesagte Formen und Farben, die Wahrnehmung verschiedenster Themen aber auch die Technische Entwicklung neuer Software, Sicherheitsrichtlinien, schnellere Prozesse oder die Vereinfachung von Codes, fordern sich regelmäßig an die neuen Gegebenheiten anzupassen.</p>
                            <p>Dies könnte man auch als den <span className={styles.inQoute}>Digitalen Darwinismus</span> bezeichnen.</p>
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <div className="content-inner">
                    <h2 className={`${roboto.className} is--centered`}>Aufgabenbereiche und Arbeitsweisen</h2>
                    <div className={'row'}>
                        <div className={'col-12 col-md-6'}>
                            <h3 className={ranga.className}>Arbeiten als Webdesigner und Frontendentwickler</h3>
                            <p>Hier trifft Kreativität auf Technik. Nach der Konzeptionsphase werden zunächst Wireframes und Screenlayouts für die verschiedenen Endgeräte erstellt. Dabei wird sowohl die Usability wie auch auf die technischen Möglichkeiten geachtet. Sind nun alle Design Aspekte mit dem Auftraggeber abgestimmt und zu seiner Zufriedenheit, geht es nun in die Technische Umsetzung. Dabei werden dann neben der Installation des geforderten Content Management System und der benötigten Plugins, dann auch die Entwicklung des eigentlichen Themes vorgenommen.. Dies wird nun unter Berücksichtigung der Aktuellen Standards und der Designvorgabe Pixelgenau umgesetzt. Dabei wird eine regelmässige Kommunikation mit dem Auftraggeber gehalten, um so schnell auch auf etwaige Änderungen reagieren zu können.</p>
                        </div>
                        <div className={'col-12 col-md-6'}>
                            <h3 className={ranga.className}>Arbeiten als Mediengestalter Digital und Print</h3>
                            <p>Um visuelle Produkte der unterschiedlichen Art zu gestalten wird künstlerisches Talent so wie technisches Fachwissen eingesetzt. So gestaltet man Firmenlogos, Banner, Plakate, Werbeschilder, Flyer und andere Drucklayouts. Nach Abstimmung mit dem Kunden erarbeitet der Mediengestalter auf dieser Grundlage ein Konzept so wie erste Entwürfe. Dabei ist er auch für die Auswahl der richtigen Farben, Bilder, Animationen und Schriften zuständig. Diese Arbeiten führt er eigenständig oder mit dem Creative Director durch und präsentiert diese dann dem Kunden zur Beurteilung und Finalisierung des Projektes. Als Grafiker befasst er sich eigenständig mit der Erstellung von Bildern, Grafiken, Layouts und achtet darauf das Lieferfristen der Projekte eingehalten werden.</p>
                        </div>
                    </div>
                    <div className="col-12 is--centered">
                        <Button
                            href="/contact"
                            title="Sie haben fragen?"
                            style="secondary-full"
                            text="Sie haben Fragen ?"
                        />
                    </div>
                </div>
            </section>
        </>
    )
}