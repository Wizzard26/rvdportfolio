import ContactData from "@/components/contact/ContactData";
import {ranga, roboto, roboto_condensed} from "@/app/fonts";
import styles from "./styles.module.css";
import HeroContent from "@/components/herocontent/page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
    title: 'Datenschutzerklärung',
    description:
        'Datenschutzerklärung für rene-van-dinter.de: keine Cookies, keine Drittanbieter-Dienste. Nur eine eigene, cookiefreie und anonyme Reichweitenmessung sowie Kontaktanfragen.',
    path: '/disclaimer',
});

// Hinweis: bewusst schlanke, an die tatsächliche Verarbeitung angepasste
// Datenschutzerklärung (private Portfolio-Seite: Hosting, Kontaktformular und
// eine eigene, cookiefreie/anonyme First-Party-Reichweitenmessung ohne
// Drittanbieter). Finale rechtliche Prüfung/Neugenerierung (z.B.
// datenschutz-generator.de) folgt.
export default function Disclaimer() {
    const pageName = 'Disclaimer';

    return (
        <>
            <main className={`${styles.disclaimer} main-content`}>
                <HeroContent
                    className="hero-container"
                    pageName={pageName}
                />
                <div className="content-inner">
                    <h1 className={`${roboto.className} is--centered`}>Datenschutzerklärung</h1>
                    <h2 className={`${ranga.className} is--centered`}>Rechtliche Informationen</h2>
                </div>

                <section>
                    <div className="content-inner">
                        <h2 className={`${roboto_condensed.className}`}>Einleitung</h2>
                        <p>Diese private Portfolio-Website verarbeitet personenbezogene Daten nur in dem Umfang, der für ihren Betrieb, für eine anonyme Reichweitenmessung und für die Beantwortung von Kontaktanfragen erforderlich ist. Es werden <strong>keine Cookies gesetzt</strong>, <strong>keine Dienste von Drittanbietern</strong> (etwa Google Analytics) eingesetzt und <strong>keine Werbe- oder Marketing-Dienste</strong> verwendet. Die Reichweitenmessung erfolgt ausschließlich mit einem eigenen, cookiefreien und anonymen Verfahren (siehe Abschnitt „Reichweitenmessung“).</p>
                        <p>Stand: Juli 2026</p>
                    </div>
                </section>

                <section className="secondary--bg">
                    <div className="content-inner">
                        <h2 className={`${roboto_condensed.className}`}>Verantwortlicher</h2>
                        <ContactData />
                    </div>
                </section>

                <section>
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Hosting und Server-Logfiles</h3>
                        <p>Beim Aufruf dieser Website werden durch den Hosting-Anbieter automatisch Informationen in sogenannten Server-Logfiles gespeichert, die Ihr Browser übermittelt. Dies sind in der Regel: IP-Adresse, Datum und Uhrzeit des Zugriffs, die aufgerufene Seite, der verwendete Browser samt Betriebssystem sowie der Referrer. Die Verarbeitung erfolgt, um einen störungsfreien Betrieb und die Sicherheit der Website zu gewährleisten.</p>
                        <ul className={styles.listUl}>
                            <li><strong>Verarbeitete Datenarten:</strong> Meta-/Kommunikationsdaten (z.B. IP-Adressen, Zugriffszeiten).</li>
                            <li><strong>Zweck:</strong> Bereitstellung und Sicherheit des Onlineangebotes.</li>
                            <li><strong>Rechtsgrundlage:</strong> Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f DSGVO).</li>
                        </ul>
                    </div>
                </section>

                <section className="secondary--bg">
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Kontaktaufnahme</h3>
                        <p>Wenn Sie über das Kontaktformular oder per E-Mail Kontakt aufnehmen, verarbeiten wir die von Ihnen angegebenen Daten (z.B. Name, E-Mail-Adresse und Ihre Nachricht), um Ihre Anfrage zu beantworten. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter und löschen sie, sobald sie für die Beantwortung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>
                        <ul className={styles.listUl}>
                            <li><strong>Verarbeitete Datenarten:</strong> Bestandsdaten (z.B. Name), Kontaktdaten (z.B. E-Mail-Adresse), Inhaltsdaten (Ihre Nachricht).</li>
                            <li><strong>Zweck:</strong> Beantwortung von Kontaktanfragen und Kommunikation.</li>
                            <li><strong>Rechtsgrundlage:</strong> Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f DSGVO) bzw. vorvertragliche Maßnahmen (Art. 6 Abs. 1 S. 1 lit. b DSGVO).</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Reichweitenmessung (eigene, cookiefreie Analyse)</h3>
                        <p>Um zu verstehen, wie diese Website genutzt wird, und sie verbessern zu können, kommt eine <strong>selbst betriebene, cookiefreie und anonyme</strong> Reichweitenmessung zum Einsatz. Es werden <strong>keine Cookies</strong> gesetzt, <strong>keine dauerhafte Kennung</strong> vergeben und <strong>keine Dienste von Drittanbietern</strong> (etwa Google Analytics) genutzt – alle Daten bleiben auf dem Server dieser Website.</p>
                        <p>Es werden <strong>weder Ihre IP-Adresse noch Ihr vollständiger Browser-Kennsatz gespeichert</strong>. Aus der IP-Adresse werden serverseitig ausschließlich ein grober Ländercode sowie ein täglich wechselnder, nicht umkehrbarer Prüfwert (Hash) zur Zählung wiederkehrender Aufrufe innerhalb eines Tages abgeleitet; die IP-Adresse selbst wird dabei sofort verworfen und nicht abgespeichert. Eine Wiedererkennung über einzelne Tage hinweg oder ein Rückschluss auf Ihre Person ist damit nicht möglich.</p>
                        <ul className={styles.listUl}>
                            <li><strong>Gemessen werden:</strong> aufgerufene Seiten, Verweildauer, Ein- und Ausstiegsseiten, die Herkunftsart des Aufrufs (direkt, Suchmaschine, KI-Assistent, soziales Netzwerk oder Verweis) samt Herkunfts-Domain, Endgerätetyp, Browser- und Betriebssystem-Familie, grober Ländercode sowie Klicks auf Schaltflächen und die Nutzung interaktiver Beispiele.</li>
                            <li><strong>Nicht verarbeitet werden:</strong> Cookies, dauerhafte Kennungen, IP-Adressen (Speicherung), Namen oder sonstige personenbezogene Profile.</li>
                            <li><strong>Zweck:</strong> anonyme statistische Auswertung zur Verbesserung von Inhalten und Bedienbarkeit.</li>
                            <li><strong>Rechtsgrundlage:</strong> Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f DSGVO). Da keine Cookies gesetzt und keine personenbezogenen Daten gespeichert werden, ist hierfür keine Einwilligung erforderlich.</li>
                            <li><strong>Speicherdauer:</strong> die anonymen Ereignisdaten werden nach spätestens 12 Monaten gelöscht.</li>
                        </ul>
                    </div>
                </section>

                <section className="secondary--bg">
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Ihre Rechte als betroffene Person</h3>
                        <p>Nach der DSGVO stehen Ihnen insbesondere folgende Rechte zu:</p>
                        <ul className={styles.listUl}>
                            <li>Recht auf Auskunft über die verarbeiteten Daten (Art. 15 DSGVO).</li>
                            <li>Recht auf Berichtigung unrichtiger Daten (Art. 16 DSGVO).</li>
                            <li>Recht auf Löschung (Art. 17 DSGVO).</li>
                            <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO).</li>
                            <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO).</li>
                            <li>Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO).</li>
                            <li>Recht auf Widerruf einer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO).</li>
                        </ul>
                        <p>Darüber hinaus haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren (Art. 77 DSGVO).</p>
                    </div>
                </section>
            </main>
        </>
    )
}
