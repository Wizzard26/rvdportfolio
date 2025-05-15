'use client';

import {roboto, ranga} from "@/app/fonts";
import Image from "next/image";
import styles from "./styles.module.css";

export default function ShowShopware() {

    return (
        <>
            <section className="secondary--bg">
                <div className="content-inner">
                    <h2 className={`${roboto.className}`}>Shopware 5 Rezept Plugin</h2>
                    <div className={`row `}>
                        <div className={`col-12 col-md-6`}>
                            <Image className={`${styles.imageAuto}`} src={`/img/casestudy/shopware/Recipelist.jpg`}
                                   alt={`Rezeptliste`} width={500} height={500}/>
                        </div>

                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>Rezeptliste mit Zusatzrechner</h3>
                            <p>Entwicklung eines individuellen Shopware-5-Plugins zur Bereitstellung einer interaktiven
                                Rezeptdatenbank für Tierhalter, die ihre Hunde oder Katzen nach dem BARF-Prinzip
                                ernähren möchten.</p>
                            <p>Ziel war es, Shop-Besucher:innen nicht nur Produkte anzubieten, sondern ihnen auch
                                fundiertes Wissen und konkrete Rezepte rund ums BARFen bereitzustellen – direkt im Shop,
                                mit direkter Verlinkung zu den passenden Produkten.</p>
                            <p>Mit dem Plugin wird der Shop zum echten Kompetenzzentrum rund ums Thema BARF. Kund:innen
                                erhalten nicht nur Produkte, sondern fundierte Informationen und maßgeschneiderte
                                Rezepte – inklusive praktischer Einkaufshilfe. Das Plugin wurde von Grund auf selbst
                                entwickelt und erweitert Shopware 5 um eine eigenständige Rezeptverwaltung</p>
                            <ul className={`content-list`}>
                                <li>Rezeptdatenbank für Hunde und Katzen</li>
                                <li>Detaillierte Zutatenlisten je Rezept</li>
                                <li>Direkte Verlinkung zu Shop-Produkten, damit alle Zutaten bequem im Warenkorb
                                    landen
                                </li>
                                <li>Zutatenrechner: basierend auf dem Gewicht des Tieres werden die exakten Mengen der
                                    Zutaten berechnet – individuell für jedes Rezept
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="">
                <div className="content-inner">
                    <h2 className={`${roboto.className}`}>Shopware 6 Erlebniswelt Elemente</h2>
                    <div className={`row row-reverse`}>
                        <div className={`col-12 col-md-6`}>
                            <Image className={`${styles.imageAuto}`} src={`/img/casestudy/shopware/gridswapbox.jpg`}
                                   alt={`Shopware Grid Element`} width={500} height={500}/>
                        </div>

                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>Erlebniswelt-Elemente für flexible
                                Content-Inszenierung</h3>
                            <p>Für ein Shopware-Projekt entwickelte ich maßgeschneiderte Erlebniswelten-Elemente, die
                                den Redakteuren ermöglichen, Inhalte flexibel und visuell ansprechend zu gestalten –
                                ohne zusätzliche Plugins oder manuelles Styling. Die Elemente basieren auf einem
                                angepassten Grid-System, sind responsive aufgebaut und lassen sich vielseitig
                                kombinieren.</p>
                            <p>Oft stoßen Redakteure schnell an gestalterische Grenzen – insbesondere, wenn Inhalte
                                visuell unterschiedlich präsentiert werden sollen, aber auf ein konsistentes Design
                                Rücksicht genommen werden muss. Die Herausforderung bestand darin, mehrere
                                Layout-Varianten zu entwickeln, die eigenständig funktionieren, sich aber dennoch
                                nahtlos in das Gesamtbild einfügen.</p>
                            <p>Jedes Element basiert auf einem flexiblen Grid-Fundament und wurde gezielt für die
                                Redaktionsarbeit optimiert. Die Bedienung in Shopware bleibt intuitiv – Inhalte können
                                einfach per Drag & Drop gepflegt werden.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="secondary--bg">
                <div className="content-inner">
                    <h2 className={`${roboto.className}`}>Slider Element Text & Bild</h2>
                    <div className={`row `}>
                        <div className={`col-12 col-md-6`}>
                            <Image className={`${styles.imageAuto}`} src={`/img/casestudy/shopware/textimageslider.jpg`}
                                   alt={`Text & Bild Slider Element`} width={500} height={500}/>
                        </div>

                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>Mehr als nur Bilder – Erweiterung des
                                Shopware-Carousels</h3>
                            <p>Modifikation des Standard-Image-Carousels in Shopware 6 zur Darstellung erweiterter
                                Inhalte direkt in den Erlebniswelten.</p>
                            <p>Verbesserung der gestalterischen und inhaltlichen Flexibilität für redaktionelle oder
                                werbliche Inhalte, ohne auf externe Plugins zurückgreifen zu müssen.</p>
                            <p>Mit dieser Erweiterung erhalten Redakteure und Shopbetreiber ein mächtiges Werkzeug zur
                                Präsentation von Content-Highlights – z.B. für Kampagnen, News oder Produkteinführungen.
                                Die Kombination aus Bild, Text und Button schafft eine hohe visuelle Präsenz und
                                verbessert zugleich die Conversion-Möglichkeiten durch klare Call-to-Actions.</p>
                            <ul className={`content-list`}>
                                <li>Layout-Anpassung: Bild links, Textbereich rechts – für eine klarere, modernere
                                    Inhaltsstruktur
                                </li>
                                <li>Zusätzliche Inhaltsfelder: Möglichkeit zur Pflege von Überschrift, Beschreibungstext
                                    und Call-to-Action-Button pro Slide
                                </li>
                                <li>Slide-Indikator: Implementierung einer fortlaufenden Slide-Navigation inklusive
                                    aktueller Position
                                </li>
                                <li>Backend-Integration: Erweiterung der Erlebniswelt-Komponente, vollständig
                                    konfigurierbar
                                </li>
                                <li>Frontend-Optimierung: Responsives Verhalten, sauberes Grid-basierendes Layout,
                                    optimiert für verschiedene Viewports
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="">
                <div className="content-inner">
                    <h2 className={`${roboto.className}`}>Shopware 6 Video-Text Banner</h2>
                    <div className={`row row-reverse`}>
                        <div className={`col-12 col-md-6`}>
                            <Image className={`${styles.imageAuto}`} src={`/img/casestudy/shopware/videotextbanner.jpg`}
                                   alt={`Video Text Banner`} width={500} height={500}/>
                        </div>

                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>Interaktiver Video-Banner mit Text</h3>
                            <p>Eigenentwicklung eines individuell konfigurierbaren Video-Banners als
                                Erlebniswelten-Element in Shopware 6 – komplett ohne externe Video-Provider oder
                                Cookie-Abfragen.</p>
                            <p>Bereitstellung eines aufmerksamkeitsstarken Banners mit nativer Video-Einbindung, das
                                DSGVO-konform ohne Drittanbieter (z.B. YouTube) auskommt und gleichzeitig redaktionell
                                flexibel bleibt.</p>
                            <p>Das Video-Banner bietet eine starke visuelle Ansprache und eignet sich ideal für
                                Markenkommunikation, Kampagnen oder emotionale Themen. Dank der einfachen Konfiguration
                                im Backend lässt sich das Element auch ohne technisches Wissen an die CI des Shops
                                anpassen.</p>
                            <ul className={`content-list`}>
                                <li>Direkte Video-Auswahl: Integration von Videos aus der Shopware-Medienverwaltung –
                                    kein externer Dienst notwendig
                                </li>
                                <li>Text-Overlay mit Gestaltungsmöglichkeiten: Konfigurierbare Überschrift,
                                    Beschreibungstext und Call-to-Action-Button
                                </li>
                                <li>Individuelles Styling: Freie Farbwahl für Text, Button und Hintergrundüberlagerung
                                    direkt im Erlebniswelten-Editor
                                </li>
                                <li>Optimiert für UX & Performance: Autoplay ohne Ton, mobil optimiert, und
                                    fallbackfähig für verschiedene Browser
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="secondary--bg">
                <div className="content-inner">
                    <h2 className={`${roboto.className}`}>Shopware 5 & 6 Chatbot</h2>
                    <div className={`row `}>
                        <div className={`col-12 col-md-6`}>
                            <Image className={`${styles.imageAuto}`} src={`/img/casestudy/shopware/chatbot4you.jpg`}
                                   alt={`Chatbot4You`} width={500} height={500}/>
                        </div>

                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>Chatbot4You Integration für Shopware 5 & 6</h3>
                            <p>Entwicklung eines Shopware-Plugins zur nahtlosen Einbindung des Chat4You-Chatbots
                                inklusive API-Anbindung und Cookie-Verwaltung.</p>
                            <p>Dieses Plugin erweitert Shopware 5 und 6 um eine voll integrierte Live-Chat- und
                                Chatbot-Lösung über den Anbieter Chat4You. Es ermöglicht Shopbetreibern eine direkte
                                Kommunikation mit ihren Kunden – entweder über den Kundenservice oder automatisiert über
                                vordefinierte Bot-Antworten.</p>
                            <p>Durch die Integration wird der Kundenservice deutlich entlastet und gleichzeitig
                                verbessert – Kunden erhalten schnell Antworten auf ihre Fragen, während der Support
                                gezielt dort eingreifen kann, wo es nötig ist. Die Lösung ist datenschutzkonform,
                                effizient und einfach zu administrieren.</p>
                            <ul className={`content-list`}>
                                <li>Nahtlose Einbindung: Integration des Chat4You-Dienstes über API</li>
                                <li>Cookie-Handling inklusive: DSGVO-konforme Einbindung mit entsprechender
                                    Cookie-Verwaltung
                                </li>
                                <li>Automatisierte Antworten: Der Bot kann häufig gestellte Fragen direkt im Shop
                                    beantworten
                                </li>
                                <li>Live-Support-Funktion: Direkte Kommunikation zwischen Kunden und Supportteam
                                    möglich
                                </li>
                                <li>Für Shopware 5 & 6: Plugin wurde für beide Shopware-Versionen individuell entwickelt
                                    und angepasst
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="">
                <div className="content-inner">
                    <h2 className={`${roboto.className}`}>Weitere Elemente</h2>
                    <div className={`row`}>
                        <div className={`col-6 col-md-3`}>
                            <div className={`${styles.imageRatio}`}>
                                <Image className={`${styles.imageAuto}`}
                                       src={`/img/casestudy/shopware/videoelement.jpg`}
                                       alt={`Video Element`} width={500} height={500}/>
                            </div>
                            <h3 className={`${ranga.className}`}>Video Element </h3>
                            <p>Ein Videoplayer welcher eigene Videos aus der Shopware Mediathek abspielt. Dadurch werden
                                keine Video Dienste benoetigt</p>
                        </div>

                        <div className={`col-6 col-md-3`}>
                            <div className={`${styles.imageRatio}`}>
                                <Image className={`${styles.imageAuto}`}
                                       src={`/img/casestudy/shopware/sharebox-open.jpg`}
                                       alt={`Video Element`} width={500} height={500}/>
                            </div>
                            <h3 className={`${ranga.className}`}>Kategorie Socialmedia Element</h3>
                            <p>Eine Kategorie in den verschiedenen Social Media Kanälen zu teilen, per E-Mail oder
                                Whatsapp zu senden</p>
                        </div>

                        <div className={`col-6 col-md-3`}>
                            <div className={`${styles.imageRatio}`}>
                                <Image className={`${styles.imageAuto}`}
                                       src={`/img/casestudy/shopware/futterrechner.jpg`}
                                       alt={`Video Element`} width={500} height={500}/>
                            </div>
                            <h3 className={`${ranga.className}`}>Produkt Futterrechner</h3>
                            <p>Hier kann Produkten ein Rechner hinzugefügt werden um zu gewissen Kriterien Futtermittel
                                zu bestimmen.</p>
                        </div>

                        <div className={`col-6 col-md-3`}>
                            <div className={`${styles.imageRatio}`}>
                                <Image className={`${styles.imageAuto}`}
                                       src={`/img/casestudy/shopware/fm_futtercalc.jpg`}
                                       alt={`Futterrechner`} width={500} height={500}/>
                            </div>
                            <h3 className={`${ranga.className}`}>Barfen Futterrechner SW 5 & 6</h3>
                            <p>Ein Komplexer Futterrechner für Einkaufs und Erlebniswelten von Shopware.</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

