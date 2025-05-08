'use client';

import ShowBox from "@/components/showcases/ShowBox";
import {caseWebEntries} from "@/lib/casestudys";
import Slider from "@/components/scripts/Slider";
import ShowLogos from "@/components/showcases/ShowLogos";
import ShowPrints from "@/components/showcases/ShowPrints";
import {ranga, roboto} from "@/app/fonts";
import Lottogenerator from "@/components/scripts/Lottogenerator";
import Cartsystem from "@/components/scripts/Cartsystem";


export default function ShowCases({cases}) {

    return (
        <>
            {cases === 'layouts' &&
                <>
                    <section className="secondary--bg">
                        <div className="content-inner">
                            <ShowBox
                                headline={'E-Commerce Layouts'}
                                data={caseWebEntries}
                                boxClass={'web'}
                                category={'eCommerce'}
                            />
                        </div>

                    </section>
                    <section>
                        <div className="content-inner">
                            <ShowBox
                                headline={'Web Layouts'}
                                data={caseWebEntries}
                                boxClass={'web'}
                                category={'website'}
                            />

                        </div>
                    </section>

                    <section className="secondary--bg">
                        <div className="content-inner">
                            <ShowLogos />
                        </div>
                    </section>

                    <section>
                        <div className="content-inner">
                            <ShowPrints/>
                        </div>
                    </section>
                </>
            }

            {cases === 'code' &&
                <>
                    <section className="secondary--bg">
                        <div className="content-inner">
                            <p><strong>INFO: Da die Scripts hier in Plain EcmaScript geschrieben sind, kann es
                                zu Rerendering Fehlern kommen.</strong></p>
                            <h2 className={`${roboto.className}`}>Einfacher Layer Slider</h2>
                            <div className={`row`}>
                                <div className={`col-12 col-md-6`}>
                                    <h3 className={`${ranga.className}`}>JavaScript Kurs Übungsaufgabe</h3>
                                    <p>Als Übungsaufgabe habe ich einen Slider mit einer Textebene und Link erstellt.
                                        Dabei wurden auch verschiedene Möglichkeiten der Konfiguration mit
                                        eingebaut.</p>
                                    <p>
                                        Als Konfigurierbare Optionen wurde folgendes in einer Config Variablen angelegt:
                                    </p>
                                    <ul className={`content-list`}>
                                        <li>Autoplay: true / false</li>
                                        <li>Stop on Hover: true / false</li>
                                        <li>Timing: Zeit in ms</li>
                                        <li>Arrows: true / false</li>
                                        <li>Punkte: true / false</li>
                                        <li>Fullscreen: true / false</li>
                                    </ul>
                                </div>
                                <div className={`col-12 col-md-6`}>
                                    <Slider/>
                                </div>
                            </div>
                        </div>

                    </section>

                    <section className="">
                        <div className="content-inner">
                            <h2 className={`${roboto.className}`}>Lotto Tipp-Generator v1</h2>
                            <div className={`row row-reverse`}>
                                <div className={`col-12 col-md-6`}>
                                    <h3 className={`${ranga.className}`}>Automatisierte Tipps für den nächsten
                                        Lottoschein</h3>
                                    <p>Immer wieder Ratlos, welche Zahlen Sie auf dem Lottoschein ankreutzen
                                        sollen? <br/>
                                        Jetzt können Sie einfach den von mir erstellten Generator nutzen und sich bis zu
                                        30 Felder
                                        vorgeben lassen.</p>
                                    <p>Egal ob 6 aus 49 oder der EuroJackpott, beide Spielsysteme können Sie einfach
                                        auswählen und
                                        mit etwas Glück werden Ihre Zahlen auch gezogen.</p>
                                </div>
                                <div className={`col-12 col-md-6`}>
                                    <Lottogenerator/>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="secondary--bg">
                        <div className="content-inner">
                            <h2 className={`${roboto.className}`}>Javascript Warenkorb v1</h2>
                            <div className={`row`}>
                                <div className={`col-12 col-md-6`}>
                                    <h3 className={`${ranga.className}`}>kleines Warenkorb System ohne Datenbank</h3>
                                    <p>Warenkorb mit Berechnung<br/>
                                        Die Daten werden nicht in der Datenbank gespeichert. Produktdaten werden aus
                                        einer JSON Datei geladen und verarbeitet.</p>
                                    <p>Anstatt über eine Cookie Session, werden die Daten im Local Storage zwischen
                                        gespeichert, so bleibt der Warenkorb bestand auch nach eienem Reload oder
                                        Seitenwechsel erhalten.</p>
                                </div>
                                <div className={`col-12 col-md-6`}>
                                    <Cartsystem />
                                </div>
                            </div>
                        </div>

                    </section>
                </>
            }
        </>
    )
}