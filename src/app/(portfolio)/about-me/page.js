import HeroContent from "@/components/herocontent/page";
import Teaser from "@/components/teaser/page";
import { getQuoteData } from "@/utils/getQuoteData";
import {ranga, roboto} from "@/app/fonts";
import styles from "./styles.module.css";
import Button from "@/components/button/Button";
import Skillset from "@/components/skillset/Skillset";
import BlockqoutesClient from "@/components/blockqoutes/BlockqoutesClient";

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
            <BlockqoutesClient quoteData={quoteData}  />
            <section className="secondary--bg">
                <div className="content-inner">
                    <h2 className={`${roboto.className} is--centered`}>Meine Kenntnisse</h2>
                    <div className={'row'}>
                        <div className={`col-12 col-md-6`}>
                            <h2 className={roboto.className}>Erworbene Fähigkeiten</h2>
                            <Skillset limit={12}/>
                        </div>
                        <div className={'col-12 col-md-6'}>
                            <h2 className={roboto.className}>Das Gestalterische und Digitale Credo</h2>
                            <h3 className={ranga.className}><span className={styles.inQoute}>Lebenslanges lernen</span> Ein nie enden wollender Prozess</h3>
                            <p>Gerade in der digitalen und kreativen Welt ist das stetige Weiterbilden wichtiger als in kaum einem anderen Beruf. Durch die dauernden Änderungen von Standards, Trends und Techniken ist das, was gestern noch angesagt war, morgen vielleicht schon überholt.
                                Das World Wide Web befindet sich in stetigem Wandel: neue Erkenntnisse über Nutzerverhalten, neue Frameworks und Tools, Sicherheitsanforderungen, schnellere Prozesse oder schlankerer Code – all das verlangt, sich regelmäßig auf die neuen Gegebenheiten einzustellen.</p>
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
                            <h3 className={ranga.className}>Arbeiten als Shopware- und Web-Developer</h3>
                            <p>Hier trifft Technik auf Gestaltung. Auf Basis der Anforderungen setze ich die Lösung um – sei es ein Shopware-Plugin, ein Storefront-Theme oder eine Komponente mit React/Next.js. Dabei achte ich auf sauberen, wartbaren Code, aktuelle Standards und eine gute User Experience. Enge Abstimmung im Team gehört für mich dazu, um früh auf Änderungen reagieren zu können – damit am Ende etwas entsteht, das technisch wie gestalterisch überzeugt.</p>
                        </div>
                        <div className={'col-12 col-md-6'}>
                            <h3 className={ranga.className}>Arbeiten als Mediengestalter Digital und Print</h3>
                            <p>Um visuelle Produkte der unterschiedlichen Art zu gestalten wird künstlerisches Talent so wie technisches Fachwissen eingesetzt. So gestaltet man Firmenlogos, Banner, Plakate, Werbeschilder, Flyer und andere Drucklayouts. Nach Abstimmung mit dem Kunden erarbeitet der Mediengestalter auf dieser Grundlage ein Konzept so wie erste Entwürfe. Dabei ist er auch für die Auswahl der richtigen Farben, Bilder, Animationen und Schriften zuständig. Diese Arbeiten führt er eigenständig oder mit dem Creative Director durch und präsentiert diese dann dem Kunden zur Beurteilung und Finalisierung des Projektes. Als Grafiker befasst er sich eigenständig mit der Erstellung von Bildern, Grafiken, Layouts und achtet darauf das Lieferfristen der Projekte eingehalten werden.</p>
                        </div>
                    </div>
                    <div className="col-12 is--centered">
                        <Button
                            href="/contact"
                            title="Sie haben Fragen?"
                            style="secondary-full"
                            text="Sie haben Fragen?"
                        />
                    </div>
                </div>
            </section>
        </>
    )
}