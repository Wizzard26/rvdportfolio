'use client';
import {ranga, roboto} from "@/app/fonts";

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
                            <p>Im zuge eines React/Next Bootcamps habe ich eine art Social Network App entwickelt, welche Darts Intusiasten miteinander verbinden soll.</p>
                            <p>Aufgaben waren erstmals die Planung von Funktionen und Bereiche, die innerhalb der vorgegebenen Zeit zu realisieren waren.</p>
                            <p>Nach Vorstellung und besprechen, wurden die Einzelnen Componenten und das Layout erstellt. Diese wurden dann mit Code Reviews als Merge Requests geprüft und Implementiert.</p>
                            <p>Dieses Projekt wurde als Fullstack App entwickelt, mit NextJs und einer MongoDB Datenbank. Zur Zeit der Planung wurde aufgrund des geringen Zeitfenster auf Basis Funktionalitäten gesetzt und eine weitere Planung für folgende features vorbehalten.</p>
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
        </>
)
}