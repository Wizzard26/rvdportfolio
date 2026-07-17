'use client';
import {ranga, roboto} from "@/app/fonts";
import CallEvent from "@/components/showcases/Callevent/CallEvent";
import Image from "next/image";
import WebPage from "@/components/showcases/WebProject/WebPage";
import TechTags from "@/components/showcases/TechTags";
import InteractionTracker from "@/components/analytics/InteractionTracker";
import SectionView from "@/components/analytics/SectionView";

export default function ShowReact() {
    return (
        <>
            <section>
                <div className="content-inner">
                    <SectionView as="h2" name={`DartPlaner – Web- & App-Plattform`} className={`${roboto.className}`}>DartPlaner – Web- & App-Plattform</SectionView>

                    <div className={`row`}>
                        <div className={`col-12 col-md-6 is--centered`}>
                            <Image src={`/img/blog/code.jpg`} width={500} height={500}
                                   alt={`DartPlaner Plattform`}/>
                        </div>

                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>Symfony · Next.js · PWA – in Entwicklung</h3>
                            <p>DartPlaner ist eine umfangreiche Plattform zur Verwaltung von Dart-Ligen, -Turnieren
                                und -Vereinen, die ich aktuell als Fullstack-Projekt entwickle. Sie ist als
                                API-getriebenes System mit mehreren eigenständigen Anwendungen aufgebaut.</p>
                            <p>Ein Backend mit Symfony und API Platform (PostgreSQL, Redis, Echtzeit über Mercure)
                                bildet die Datenbasis – modelliert nach Domain-Driven-Design über mehrere Bounded
                                Contexts. Darauf setzen mehrere Next.js-Anwendungen auf:</p>
                            <ul className={`content-list`}>
                                <li>Admin-Dashboard – Verwaltung von Verbänden, Ligen, Saisons, Spielplänen und
                                    Statistiken
                                </li>
                                <li>Player-App (PWA) – mobile, offline-fähige App für Spieler inkl. Trainingsmodi</li>
                                <li>Scorer-App (PWA) – eigenständiges, offline-fähiges Dart-Scoring</li>
                            </ul>
                            <p>Technische Schwerpunkte: offline-fähige PWAs mit lokaler Datenhaltung und
                                Synchronisation, Echtzeit-Updates per WebSocket sowie eine sauber nach Domänen
                                strukturierte Architektur. Das Projekt befindet sich in aktiver Entwicklung.</p>
                            <TechTags tags={["Symfony", "API Platform", "PostgreSQL", "Mercure", "Next.js", "React", "TypeScript", "PWA"]} />
                        </div>
                    </div>
                </div>
            </section>

            <section className="secondary--bg">
                <div className="content-inner">
                    <SectionView as="h2" name={`DartsConnect Netzwerk App`} className={`${roboto.className}`}>DartsConnect Netzwerk App</SectionView>

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
                            <p>Im Zuge eines React/Next-Bootcamps habe ich eine Art Social-Network-App entwickelt,
                                die Darts-Enthusiasten miteinander verbinden soll.</p>
                            <p>Zunächst galt es, die Funktionen und Bereiche zu planen, die sich innerhalb der
                                vorgegebenen Zeit umsetzen ließen.</p>
                            <p>Nach Konzeption und Abstimmung habe ich die einzelnen Komponenten und das Layout selbst
                                umgesetzt – eingebunden über einen Git-Workflow mit Pull-Requests, die im Team per
                                Code-Review abgenommen wurden.</p>
                            <p>Die App habe ich als Fullstack-Anwendung mit Next.js und einer MongoDB umgesetzt – der
                                gesamte Code stammt von mir, darunter Authentifizierung, Benutzerprofile und das
                                Chat-System. Aufgrund des knappen Zeitfensters lag der Fokus auf den
                                Kern-Funktionalitäten.</p>
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
                            <TechTags tags={["Next.js", "React", "MongoDB", "Mongoose", "Auth"]} />
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="content-inner">
                    <SectionView as="h2" name={`Calendly Meeting Clone`} className={`${roboto.className}`}>Calendly Meeting Clone</SectionView>

                    <div className={`row row-reverse`}>
                        <div className={`col-12 col-md-7 col-lg-7 col-xl-7 is--centered`}>
                            <InteractionTracker name="Calendly Clone (Terminbuchung)">
                                <CallEvent/>
                            </InteractionTracker>
                        </div>

                        <div className={`col-12 col-md-5 col-lg-5 col-xl-5 `}>
                            <h3 className={`${ranga.className}`}>React/Next Meeting Planer</h3>
                            <p>Im Rahmen eines Portfolios habe ich einen Calendly-ähnlichen Meeting-Planer mit Next.js
                                entwickelt – komplett ohne Abo-Modell oder Einschränkungen, um Meetings schnell und
                                einfach planen zu können.</p>
                            <p>In der ersten Entwicklungsphase wurden die grundlegenden Funktionen umgesetzt. Die
                                verfügbaren Termine wurden dabei zunächst aus einer statischen JSON-Datei geladen – wie
                                in der Demo zu sehen. Für aktive Tage wurden entsprechende Time-Slots definiert, die –
                                sofern verfügbar – vom Nutzer ausgewählt werden können. Die JSON-Struktur wurde dabei
                                so aufgebaut, dass sich daraus direkt ein Datenbankschema ableiten lässt.</p>
                            <p>Nach dem Abschluss dieser ersten Version folgte die Entwicklung einer datenbankgestützten
                                Variante – erneut mit Next.js, nun in Kombination mit einer MongoDB. Diese Version wurde
                                als Fullstack-Anwendung realisiert, inklusive eines Admin-Bereichs zur Pflege der
                                Termine über eine API. Neue Buchungen werden dort gelistet und können durch den
                                Betreiber bestätigt oder abgelehnt werden.</p>
                            <p>Sobald ein Nutzer einen Termin bucht, werden die entsprechenden Informationen und
                                Bestätigungen automatisiert per E-Mail sowohl an den Nutzer als auch an den Betreiber
                                gesendet – ebenfalls über eine API.</p>
                            <TechTags tags={["Next.js", "React", "MongoDB", "REST-API", "Mail-API"]} />
                        </div>
                    </div>
                </div>
            </section>

            <section className="secondary--bg">
                <div className="content-inner">
                    <SectionView as="h2" name={`Event Kalender Planer`} className={`${roboto.className}`}>Event Kalender Planer</SectionView>

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
                                wodurch sich die App leicht an eine datenbankgestützte Version mit Rollen- und
                                Rechteverwaltung anbinden lässt.</p>
                            <p>Die Ansicht ist voll responsiv und lässt sich flexibel auf verschiedene Anforderungen und
                                Nutzergruppen anpassen – sei es als interne Projektübersicht, Eventkalender oder
                                Booking-System.</p>
                            <TechTags tags={["Next.js", "React", "JSON"]} />
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="content-inner">
                    <SectionView as="h2" name={`Multi-Step Web-Projekt Konfigurator`} className={`${roboto.className}`}>Multi-Step Web-Projekt Konfigurator</SectionView>

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
                            <TechTags tags={["Next.js", "React", "Mail-API"]} />
                        </div>
                    </div>
                </div>
            </section>

            <section className="secondary--bg">
                <div className="content-inner">
                    <SectionView as="h2" name={`Eigene Fullstack-Business-Plattform`} className={`${roboto.className}`}>Eigene Fullstack-Business-Plattform</SectionView>

                    <div className={`row`}>
                        <div className={`col-12 col-md-6 is--centered`}>
                            <Image src={`/img/blog/code.jpg`} width={500} height={500}
                                   alt={`Fullstack-Business-Plattform`}/>
                        </div>

                        <div className={`col-12 col-md-6`}>
                            <h3 className={`${ranga.className}`}>Next.js · React · MongoDB – produktiv im Einsatz</h3>
                            <p>Was als CMS begann, ist zu einer vollständigen, selbst entwickelten Business-Plattform
                                gewachsen – umgesetzt als Next.js-Fullstack-Anwendung mit MongoDB. Sie läuft produktiv
                                (im Einsatz hinter Gambit24) und geht weit über ein klassisches CMS hinaus: Website,
                                Kundenverwaltung und internes Projektmanagement in einem System.</p>
                            <p>Konzept, Frontend, Backend, Adminbereich und ein eigenes Kundenportal habe ich
                                eigenständig umgesetzt.</p>
                            <p>
                                <strong>Funktionsbereiche:</strong><br/>
                            </p>
                            <ul className={`content-list`}>
                                <li>CMS – dynamische Seiten & Navigationen, News, FAQ, Case Studies und
                                    Medienverwaltung mit Rich-Text-Editor
                                </li>
                                <li>CRM – Kunden, Angebote & Angebotsanfragen, Rechnungen, Nachrichten und
                                    Service-Pakete
                                </li>
                                <li>Projektmanagement – Projekte, To-dos, Zeiterfassung, Status-Updates und
                                    Controlling
                                </li>
                                <li>Kundenportal – eigener, geschützter Login-Bereich für Kunden</li>
                                <li>Analytics – eigenes Tracking & Auswertungen (Besucher, Seitenaufrufe) mit
                                    Dashboards
                                </li>
                                <li>Rollen- & Rechteverwaltung, Termin-Buchung, Newsletter und Benachrichtigungen</li>
                            </ul>
                            <p>Das Projekt zeigt, dass ich komplexe Fullstack-Anwendungen eigenständig konzipieren,
                                bauen und produktiv betreiben kann.</p>
                            <TechTags tags={["Next.js", "React", "MongoDB", "NextAuth", "Recharts", "REST-API"]} />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}