'use client';
import {ranga, roboto} from "@/app/fonts";
import CallEvent from "@/components/showcases/Callevent/CallEvent";
import Image from "next/image";
import WebPage from "@/components/showcases/WebProject/WebPage";

export default function ShowReact() {
    return (
        <>
            <section className="secondary--bg">
                <div className="content-inner">
                    <h2 className={`${roboto.className}`}>DartsConnect Netzwerk App</h2>

                    <div className={`row`}>
                        <div className={`col-12 col-md-6 is--centered`}>
                            <video
                                className={`promo-video`}
                                width="100%"
                                height="100%"
                                controls
                            >
                                <source src="/video/dartsconnect.mp4" type="video/mp4"/>
                            </video>
                        </div>

                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>React/Next Capstone Project</h3>
                            <p>Im Zuge eines React/Next Bootcamps habe ich eine art Social Network App entwickelt,
                                welche Darts Intusiasten miteinander verbinden soll.</p>
                            <p>Aufgaben waren erstmals die Planung von Funktionen und Bereiche, die innerhalb der
                                vorgegebenen Zeit zu realisieren waren.</p>
                            <p>Nach Vorstellung und besprechen, wurden die Einzelnen Componenten und das Layout
                                erstellt. Diese wurden dann mit Code Reviews als Merge Requests geprüft und
                                Implementiert.</p>
                            <p>Dieses Projekt wurde als Fullstack App entwickelt, mit NextJs und einer MongoDB
                                Datenbank. Zur Zeit der Planung wurde aufgrund des geringen Zeitfenster auf Basis
                                Funktionalitäten gesetzt und eine weitere Planung für folgende features vorbehalten.</p>
                            <p>Aktuelle Funktionen: </p>
                            <ul className={`content-list`}>
                                <li>Register & Login</li>
                                <li>Benutzer Profile und Rollen</li>
                                <li>Spieler Übersicht</li>
                                <li>Spieler Profil</li>
                                <li>Favoriten / Freundeslisten</li>
                                <li>One on One Chat</li>
                                <li>Gruppen Chat</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="content-inner">
                    <h2 className={`${roboto.className}`}>Calendly Meeting Clone</h2>

                    <div className={`row row-reverse`}>
                        <div className={`col-12 col-md-7 col-lg-7 col-xl-7 is--centered`}>
                            <CallEvent/>
                        </div>

                        <div className={`col-12 col-md-5 col-lg-5 col-xl-5 `}>
                            <h3 className={`${ranga.className}`}>React/Next Meeting Planer</h3>
                            <p>Im Rahmen eines Portfolios habe ich einen Calendly-ähnlichen Meeting-Planer mit Next.js
                                entwickelt – komplett ohne Abo-Modell oder Einschränkungen, um Meetings schnell und
                                einfach planen zu können.</p>
                            <p>In der ersten Entwicklungsphase wurden die grundlegenden Funktionen umgesetzt. Die
                                verfügbaren Termine wurden dabei zunächst aus einer statischen JSON-Datei geladen – wie
                                in der Demo zu sehen. Für aktive Tage wurden entsprechende Time-Slots definiert, die –
                                sofern verfügbar – vom Nutzer ausgewählt werden können. Die JSON-Struktur wurde so
                                vorbereitet, dass sich daraus problemlos ein Datenbankschema ableiten lässt. Geplant
                                ist, darin Informationen wie Start- und Endzeit, den Anfragesteller sowie etwaige
                                eingeladene Gäste zu speichern.</p>
                            <p>Nach dem Abschluss dieser ersten Version folgte die Entwicklung einer datenbankgestützten
                                Variante – erneut mit Next.js, nun in Kombination mit einer MongoDB. Diese Version wurde
                                als Fullstack-Anwendung realisiert, inklusive eines Admin-Bereichs zur Pflege der
                                Termine über eine API. Neue Buchungen werden dort gelistet und können durch den
                                Betreiber bestätigt oder abgelehnt werden.</p>
                            <p>Sobald ein Nutzer einen Termin bucht, werden die entsprechenden Informationen und
                                Bestätigungen automatisiert per E-Mail sowohl an den Nutzer als auch an den Betreiber
                                gesendet – ebenfalls über eine API. Die Anwendung wird laufend weiterentwickelt, um
                                zusätzliche Funktionen zu integrieren.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="secondary--bg">
                <div className="content-inner">
                    <h2 className={`${roboto.className}`}>Event Kalender Planer</h2>

                    <div className={`row`}>
                        <div className={`col-12 col-md-6 is--centered`}>
                            <Image src={`/img/casestudy/web/calendarapp.jpg`} width={500} height={500}
                                   alt={`Kalender Planer App`}/>
                        </div>

                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>React/Next Event Planer</h3>
                            <p>Dieser Event-Planer wurde mit React und Next.js entwickelt und ermöglicht die
                                übersichtliche Verwaltung und Darstellung von Veranstaltungen in verschiedenen Ansichten
                                wie Monat, Woche, Tag oder Jahr – ganz ähnlich wie man es von gängigen Kalender-Tools
                                kennt.</p>
                            <p>In der Monatsansicht lassen sich Termine visuell strukturiert erfassen und anzeigen.
                                Jeder Event kann mit einem Titel, einer Beschreibung, einem Typ (z.B. Meeting,
                                Geburtstag, Konferenz) sowie Zusatzinfos wie Uhrzeit oder Teilnehmer versehen werden.
                                Mehrere Einträge am selben Tag werden gestapelt dargestellt und sind interaktiv
                                anklickbar.</p>
                            <p>Die Termin-Daten stammen in der aktuellen Version aus einer strukturierten JSON-Datei,
                                wodurch sich die App leicht an eine Datenbank-gestützte Version anbinden lässt. Ziel ist
                                es, daraus später ein vollständiges Backend mit Datenbankanbindung zu entwickeln,
                                inklusive Rollenverwaltung, Rechtevergabe und Terminverwaltung per API.</p>
                            <p>Die Ansicht ist voll responsiv und lässt sich flexibel auf verschiedene Anforderungen und
                                Nutzergruppen anpassen – sei es als interne Projektübersicht, Eventkalender oder
                                Booking-System.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="content-inner">
                    <h2 className={`${roboto.className}`}>Multi-Step Web-Projekt Konfigurator</h2>

                    <div className={`row row-reverse`}>
                        <div className={`col-12 col-md-6 is--centered`}>
                            <WebPage/>
                        </div>

                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>React/Next Multistep Formular</h3>
                            <p>Mit diesem interaktiven Multi-Step Konfigurator können Interessenten ihr geplantes
                                Webprojekt Schritt für Schritt strukturieren und erste Anforderungen definieren – ganz
                                ohne technisches Vorwissen.</p>
                            <p>In mehreren logisch aufgebauten Abschnitten werden gezielte Fragen zu wichtigen
                                Projektbereichen gestellt, darunter z.B. Zielsetzung, Funktionsumfang,
                                Designvorstellungen, technische Anforderungen oder Zeitplan. Die Antworten lassen sich
                                bequem per Klick auswählen oder in Textfeldern ergänzen.</p>
                            <p>Am Ende wird der ausgefüllte Konfigurator über eine E-Mail-API an den Betreiber
                                übermittelt. Auf Basis dieser Informationen kann eine erste Machbarkeitsanalyse
                                erfolgen, um den Projektumfang besser einzuschätzen und ein individuelles,
                                zielgerichtetes Angebot zu erstellen.</p>
                            <p>Der Konfigurator ist flexibel erweiterbar und lässt sich auf verschiedene Use-Cases
                                anpassen – z.B. für Websites, Shops, Plattformen oder individuelle Web-Apps.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="secondary--bg">
                <div className="content-inner">
                    <h2 className={`${roboto.className}`}>Mini CMS System</h2>

                    <div className={`row`}>
                        <div className={`col-12 col-md-6 is--centered`}>
                            <Image src={`/img/blog/code.jpg`} width={500} height={500}
                                   alt={`Kalender Planer App`}/>
                        </div>

                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>React/Next Portfolio CMS</h3>
                            <p>Für ein Portfolio habe ich ein eigenes, leichtgewichtiges Content-Management-System (CMS)
                                auf Basis von Next.js entwickelt – komplett als Fullstack-Lösung. Ziel war es, sowohl
                                das Frontend als auch das Backend inklusive Adminbereich eigenständig zu realisieren, um
                                zentrale CMS-Funktionalitäten und moderne Technologien praxisnah zu vereinen.</p>
                            <p>Der Fokus lag auf einer modularen und erweiterbaren Struktur, die sich flexibel an
                                individuelle Anforderungen anpassen lässt.</p>
                            <p>
                                <strong>Zu den umgesetzten Funktionen gehören unter anderem:</strong><br/>
                            </p>
                            <ul className={`content-list`}>
                                <li>Dynamisches Navigationssystem – Menüpunkte und Seiten lassen sich zentral
                                    verwalten und beliebig erweitern
                                </li>
                                <li>Landingpages mit individuellen URLs – Inhalte und Strukturen sind vollständig
                                    anpassbar
                                </li>
                                <li>Benutzerverwaltung – Anlage, Bearbeitung und Rechtevergabe von Nutzern im
                                    Adminbereich
                                </li>
                                <li>Blog-/News-System – Einfache Verwaltung und Veröffentlichung von Beiträgen</li>
                                <li>Meeting-System im Stil von Calendly – Termine und Timeslots können erstellt und
                                    gebucht werden
                                </li>
                                <li>Dashboard mit Besucherzähler – Übersicht über Seitenaufrufe und Anfragen</li>
                                <li>Bilder-Upload – Hochladen und Verwalten von Bildern direkt auf dem eigenen
                                    Server
                                </li>
                                <li>Case Studies & Referenzen – Verwaltung und Darstellung im Frontend über ein
                                    strukturiertes Datensystem
                                </li>
                            </ul>
                            <p></p>
                            <p>Dieses Projekt diente nicht nur der Weiterentwicklung meiner Next.js- und
                                Fullstack-Kompetenzen, sondern zeigt auch, wie mit einem durchdachten Aufbau bereits mit
                                wenig Overhead ein eigenständiges CMS-System realisiert werden kann – ideal für
                                individuelle Portfolios oder kleinere Kundenprojekte.</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}