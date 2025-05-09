'use client';

import {ranga, roboto} from "@/app/fonts";
import Slider from "@/components/scripts/Slider";
import Lottogenerator from "@/components/scripts/Lottogenerator";
import Cartsystem from "@/components/scripts/Cartsystem";
import Modalbox from "@/components/scripts/Modalbox";

export default function ShowJavascripts() {
    return (
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
                            <p>Immer wieder Ratlos, welche Zahlen Sie auf dem Lottoschein ankreuzen
                                sollen? <br/>
                                Jetzt können Sie einfach den von mir erstellten Generator nutzen und sich bis zu
                                30 Felder
                                vorgeben lassen.</p>
                            <p>Egal ob 6 aus 49 oder der EuroJackpot, beide Spielsysteme können Sie einfach
                                auswählen und
                                mit etwas Glück werden Ihre Zahlen auch gezogen.</p>
                            <p>Zu berücksichtigen ist, das dieses Script noch zu dem Alten Jackpot System erstellt
                                wurde, mit weniger Zusatzzahlen.</p>
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
                            <Cartsystem/>
                        </div>
                    </div>
                </div>

            </section>

            <section className="">
                <div className="content-inner">
                    <h2 className={`${roboto.className}`}>Modalbox TestScript</h2>
                    <div className={`row row-reverse`}>
                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>Modalbox schnell erstellt als Testaufgabe</h3>
                            <p>Bei einem Gespräch wurde diese Modalbox erstellt um meine Rangeheweise an eine Aufgabenstellung zu testen. Verständniss für die Aufgabenstellung, welche Rückfragen ergeben sich und wie plane ich die Aufgabe zu lösen.</p>
                            <p>Danach folgte dann die Umsetzung im LiveCoding, dabei erstellte ich auf der Grünen Wiese, erst die Html und CSS Struktur mit dem Demo Content. Danach im Javascript die Events und Funktionen.</p>
                            <p>Letztendlich folgte dann das Debugging und weitere Umsetzungen, welche nicht direkt in der Aufgabenstellung vorgesehen waren.</p>
                        </div>
                        <div className={`col-12 col-md-6`}>
                            <Modalbox />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}