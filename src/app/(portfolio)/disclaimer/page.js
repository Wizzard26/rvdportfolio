import ContactData from "@/components/contact/ContactData";
import {ranga, roboto, roboto_condensed} from "@/app/fonts";
import styles from "./styles.module.css";

export default function Disclaimer() {
    return (
        <>
            <main className={`${styles.disclaimer} main-content`}>
                <div className="content-inner">
                    <h1 className={`${roboto.className} is--centered`}>Datenschutzerklärung</h1>
                    <h2 className={`${ranga.className} is--centered`}>Rechtliche Informationen</h2>
                </div>
                <section>
                    <div className="content-inner">
                        <h2 className={`${roboto_condensed.className}`}>Einleitung</h2>
                        <p>Mit der folgenden Datenschutzerklärung möchten wir Sie darüber aufklären, welche Arten Ihrer personenbezogenen Daten (nachfolgend auch kurz als Daten bezeichnet) wir zu welchen Zwecken und in welchem Umfang verarbeiten. Die Datenschutzerklärung gilt für alle von uns durchgeführten Verarbeitungen personenbezogener Daten, sowohl im Rahmen der Erbringung unserer Leistungen als auch insbesondere auf unseren Webseiten, in mobilen Applikationen sowie innerhalb externer Onlinepräsenzen, wie z.B. unserer Social-Media-Profile (nachfolgend zusammenfassend bezeichnet als Onlineangebot).
                            Die verwendeten Begriffe sind nicht geschlechtsspezifisch.
                            Stand: 13. April 2020</p>
                    </div>
                </section>
                <section className="secondary--bg">
                    <div className="content-inner">
                        <ContactData />
                    </div>
                </section>
                <section>
                    <div className="content-inner">
                        <h2 className={`${roboto_condensed.className}`}>Übersicht der Verarbeitungen</h2>
                        <p>Die nachfolgende Übersicht fasst die Arten der verarbeiteten Daten und die Zwecke ihrer Verarbeitung zusammen und verweist auf die betroffenen Personen.</p>
                        <h3 className={`${roboto_condensed.className}`}>Arten der verarbeiteten Daten</h3>
                        <ul className={styles.listUl}>
                            <li>Bestandsdaten (z.B. Namen, Adressen).</li>
                            <li>Inhaltsdaten  (z.B. Texteingaben, Fotografien, Videos).</li>
                            <li>Kontaktdaten (z.B. E-Mail, Telefonnummern).</li>
                            <li>Meta-/Kommunikationsdaten (z.B. Geräte-Informationen, IP-Adressen).</li>
                            <li>Nutzungsdaten  (z.B. besuchte Webseiten, Interesse an Inhalten, Zugriffszeiten).</li>
                            <li>Standortdaten (Daten, die den Standort des Endgeräts eines Endnutzers angeben).</li>
                            <li>Vertragsdaten  (z.B. Vertragsgegenstand, Laufzeit, Kundenkategorie).</li>
                            <li>Zahlungsdaten (z.B. Bankverbindungen, Rechnungen, Zahlungshistorie).</li>
                        </ul>
                    </div>
                </section>
                <section className="secondary--bg">
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Kategorien betroffener Personen</h3>
                        <ul className={styles.listUl}>
                            <li>Geschäfts- und Vertragspartner.</li>
                            <li>Interessenten.</li>
                            <li>Kommunikationspartner.</li>
                            <li>Nutzer (z.B. Webseitenbesucher, Nutzer von Onlinediensten).</li>
                        </ul>
                    </div>
                </section>
                <section>
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Zwecke der Verarbeitung</h3>
                        <ul className={styles.listUl}>
                            <li>Bereitstellung unseres Onlineangebotes und Nutzerfreundlichkeit.</li>
                            <li>Besuchsaktionsauswertung.</li>
                            <li>Büro- und Organisationsverfahren.</li>
                            <li>Cross-Device Tracking (geräteübergreifende Verarbeitung von Nutzerdaten für Marketingzwecke).</li>
                            <li>Direktmarketing (z.B. per E-Mail oder postalisch).</li>
                            <li>Feedback (z.B. Sammeln von Feedback via Online-Formular).</li>
                            <li>Interessenbasiertes und verhaltensbezogenes Marketing.</li>
                            <li>Kontaktanfragen und Kommunikation.</li>
                            <li>Konversionsmessung (Messung der Effektivität von Marketingmaßnahmen).</li>
                            <li>Profiling (Erstellen von Nutzerprofilen).</li>
                            <li>Remarketing.</li>
                            <li>Reichweitenmessung (z.B. Zugriffsstatistiken, Erkennung wiederkehrender Besucher).</li>
                            <li>Sicherheitsmaßnahmen.</li>
                            <li>Tracking (z.B. interessens-/verhaltensbezogenes Profiling, Nutzung von Cookies).</li>
                            <li>Vertragliche Leistungen und Service.</li>
                            <li>Verwaltung und Beantwortung von Anfragen.</li>
                            <li>Zielgruppenbildung (Bestimmung von für Marketingzwecke relevanten Zielgruppen oder sonstige Ausgabe von Inhalten).</li>
                        </ul>
                    </div>
                </section>
                <section className="secondary--bg">
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Maßgebliche Rechtsgrundlagen</h3>
                        <p>Im Folgenden teilen wir die Rechtsgrundlagen der Datenschutzgrundverordnung (DSGVO), auf deren Basis wir die personenbezogenen Daten verarbeiten, mit. Bitte beachten Sie, dass zusätzlich zu den Regelungen der DSGVO die nationalen Datenschutzvorgaben in Ihrem bzw. unserem Wohn- und Sitzland gelten können. Sollten ferner im Einzelfall speziellere Rechtsgrundlagen maßgeblich sein, teilen wir Ihnen diese in der Datenschutzerklärung mit.</p>
                        <ul className={styles.listUl}>
                            <li><strong>Einwilligung (Art. 6 Abs. 1 S. 1 lit. a DSGVO)</strong> - Die betroffene Person hat ihre Einwilligung in die Verarbeitung der sie betreffenden personenbezogenen Daten für einen spezifischen Zweck oder mehrere bestimmte Zwecke gegeben.</li>
                            <li><strong>Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1 S. 1 lit. b. DSGVO)</strong> - Die Verarbeitung ist für die Erfüllung eines Vertrags, dessen Vertragspartei die betroffene Person ist, oder zur Durchführung vorvertraglicher Maßnahmen erforderlich, die auf Anfrage der betroffenen Person erfolgen.</li>
                            <li><strong>Rechtliche Verpflichtung (Art. 6 Abs. 1 S. 1 lit. c. DSGVO)</strong> - Die Verarbeitung ist zur Erfüllung einer rechtlichen Verpflichtung erforderlich, der der Verantwortliche unterliegt.</li>
                            <li><strong>Schutz lebenswichtiger Interessen (Art. 6 Abs. 1 S. 1 lit. d. DSGVO)</strong> - Die Verarbeitung ist erforderlich, um lebenswichtige Interessen der betroffenen Person oder einer anderen natürlichen Person zu schützen.</li>
                            <li><strong>Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f. DSGVO)</strong> - Die Verarbeitung ist zur Wahrung der berechtigten Interessen des Verantwortlichen oder eines Dritten erforderlich, sofern nicht die Interessen oder Grundrechte und Grundfreiheiten der betroffenen Person, die den Schutz personenbezogener Daten erfordern, überwiegen.</li>
                        </ul>
                        <p>Nationale Datenschutzregelungen in Deutschland: Zusätzlich zu den Datenschutzregelungen der Datenschutz-Grundverordnung gelten nationale Regelungen zum Datenschutz in Deutschland. Hierzu gehört insbesondere das Gesetz zum Schutz vor Missbrauch personenbezogener Daten bei der Datenverarbeitung (Bundesdatenschutzgesetz – BDSG). Das BDSG enthält insbesondere Spezialregelungen zum Recht auf Auskunft, zum Recht auf Löschung, zum Widerspruchsrecht, zur Verarbeitung besonderer Kategorien personenbezogener Daten, zur Verarbeitung für andere Zwecke und zur Übermittlung sowie automatisierten Entscheidungsfindung im Einzelfall einschließlich Profiling. Des Weiteren regelt es die Datenverarbeitung für Zwecke des Beschäftigungsverhältnisses (§ 26 BDSG), insbesondere im Hinblick auf die Begründung, Durchführung oder Beendigung von Beschäftigungsverhältnissen sowie die Einwilligung von Beschäftigten. Ferner können Landesdatenschutzgesetze der einzelnen Bundesländer zur Anwendung gelangen.</p>
                    </div>
                </section>
                <section>
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Sicherheitsmaßnahmen</h3>
                        <p>Wir treffen nach Maßgabe der gesetzlichen Vorgaben unter Berücksichtigung des Stands der Technik, der Implementierungskosten und der Art, des Umfangs, der Umstände und der Zwecke der Verarbeitung sowie der unterschiedlichen Eintrittswahrscheinlichkeiten und des Ausmaßes der Bedrohung der Rechte und Freiheiten natürlicher Personen geeignete technische und organisatorische Maßnahmen, um ein dem Risiko angemessenes Schutzniveau zu gewährleisten.</p>
                        <p>Zu den Maßnahmen gehören insbesondere die Sicherung der Vertraulichkeit, Integrität und Verfügbarkeit von Daten durch Kontrolle des physischen und elektronischen Zugangs zu den Daten als auch des sie betreffenden Zugriffs, der Eingabe, der Weitergabe, der Sicherung der Verfügbarkeit und ihrer Trennung. Des Weiteren haben wir Verfahren eingerichtet, die eine Wahrnehmung von Betroffenenrechten, die Löschung von Daten und Reaktionen auf die Gefährdung der Daten gewährleisten. Ferner berücksichtigen wir den Schutz personenbezogener Daten bereits bei der Entwicklung bzw. Auswahl von Hardware, Software sowie Verfahren entsprechend dem Prinzip des Datenschutzes, durch Technikgestaltung und durch datenschutzfreundliche Voreinstellungen.</p>
                    </div>
                </section>
                <section className="secondary--bg">
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Übermittlung und Offenbarung von personenbezogenen Daten</h3>
                        <p>Im Rahmen unserer Verarbeitung von personenbezogenen Daten kommt es vor, dass die Daten an andere Stellen, Unternehmen, rechtlich selbstständige Organisationseinheiten oder Personen übermittelt oder sie ihnen gegenüber offengelegt werden. Zu den Empfängern dieser Daten können z.B. Zahlungsinstitute im Rahmen von Zahlungsvorgängen, mit IT-Aufgaben beauftragte Dienstleister oder Anbieter von Diensten und Inhalten, die in eine Webseite eingebunden werden, gehören. In solchen Fall beachten wir die gesetzlichen Vorgaben und schließen insbesondere entsprechende Verträge bzw. Vereinbarungen, die dem Schutz Ihrer Daten dienen, mit den Empfängern Ihrer Daten ab.</p>
                    </div>
                </section>
                <section>
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Datenverarbeitung in Drittländern</h3>
                        <p>Sofern wir Daten in einem Drittland (d.h., außerhalb der Europäischen Union (EU), des Europäischen Wirtschaftsraums (EWR)) verarbeiten oder die Verarbeitung im Rahmen der Inanspruchnahme von Diensten Dritter oder der Offenlegung bzw. Übermittlung von Daten an andere Personen, Stellen oder Unternehmen stattfindet, erfolgt dies nur im Einklang mit den gesetzlichen Vorgaben. </p>
                        <p>Vorbehaltlich ausdrücklicher Einwilligung oder vertraglich oder gesetzlich erforderlicher Übermittlung verarbeiten oder lassen wir die Daten nur in Drittländern mit einem anerkannten Datenschutzniveau, zu denen die unter dem Privacy-Shield zertifizierten US-Verarbeiter gehören, oder auf Grundlage besonderer Garantien, wie z.B. vertraglicher Verpflichtung durch sogenannte Standardschutzklauseln der EU-Kommission, des Vorliegens von Zertifizierungen oder verbindlicher interner Datenschutzvorschriften, verarbeiten (Art. 44 bis 49 DSGVO, Informationsseite der EU-Kommission: <a href="https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection_de" target="_blank">https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection_de</a> ).</p>
                    </div>
                </section>
                <section className="secondary--bg">
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Einsatz von Cookies</h3>
                        <p>Cookies sind Textdateien, die Daten von besuchten Websites oder Domains enthalten und von einem Browser auf dem Computer des Benutzers gespeichert werden. Ein Cookie dient in erster Linie dazu, die Informationen über einen Benutzer während oder nach seinem Besuch innerhalb eines Onlineangebotes zu speichern. Zu den gespeicherten Angaben können z.B. die Spracheinstellungen auf einer Webseite, der Loginstatus, ein Warenkorb oder die Stelle, an der ein Video geschaut wurde, gehören. Zu dem Begriff der Cookies zählen wir ferner andere Technologien, die die gleichen Funktionen wie Cookies erfüllen (z.B., wenn Angaben der Nutzer anhand pseudonymer Onlinekennzeichnungen gespeichert werden, auch als Nutzer-IDs bezeichnet)</p>
                        <p><strong className={`${roboto_condensed.className}`}>Die folgenden Cookie-Typen und Funktionen werden unterschieden:</strong></p>
                        <ul className={styles.listUl}><li><strong>Temporäre Cookies (auch: Session- oder Sitzungs-Cookies):</strong> Temporäre Cookies werden spätestens gelöscht, nachdem ein Nutzer ein Online-Angebot verlassen und seinen Browser geschlossen hat.</li><li><strong>Permanente Cookies:</strong> Permanente Cookies bleiben auch nach dem Schließen des Browsers gespeichert. So kann beispielsweise der Login-Status gespeichert oder bevorzugte Inhalte direkt angezeigt werden, wenn der Nutzer eine Website erneut besucht. Ebenso können die Interessen von Nutzern, die zur Reichweitenmessung oder zu Marketingzwecken verwendet werden, in einem solchen Cookie gespeichert werden.</li><li><strong>First-Party-Cookies:</strong> First-Party-Cookies werden von uns selbst gesetzt.</li><li><strong>Third-Party-Cookies (auch: Drittanbieter-Cookies)</strong>: Drittanbieter-Cookies werden hauptsächlich von Werbetreibenden (sog. Dritten) verwendet, um Benutzerinformationen zu verarbeiten.</li><li><strong>Notwendige (auch: essentielle oder unbedingt erforderliche) Cookies:</strong> Cookies können zum einen für den Betrieb einer Webseite unbedingt erforderlich sein (z.B. um Logins oder andere Nutzereingaben zu speichern oder aus Gründen der Sicherheit).</li><li><strong>Statistik-, Marketing- und Personalisierungs-Cookies</strong>: Ferner werden Cookies im Regelfall auch im Rahmen der Reichweitenmessung eingesetzt sowie dann, wenn die Interessen eines Nutzers oder sein Verhalten (z.B. Betrachten bestimmter Inhalte, Nutzen von Funktionen etc.) auf einzelnen Webseiten in einem Nutzerprofil gespeichert werden. Solche Profile dienen dazu, den Nutzern z.B. Inhalte anzuzeigen, die ihren potentiellen Interessen entsprechen. Dieses Verfahren wird auch als Tracking, d.h., Nachverfolgung der potentiellen Interessen der Nutzer bezeichnet. . Soweit wir Cookies oder Tracking-Technologien einsetzen, informieren wir Sie gesondert in unserer Datenschutzerklärung oder im Rahmen der Einholung einer Einwilligung.</li></ul><br/><br/>
                        <p><strong>Hinweise zu Rechtsgrundlagen: </strong> Auf welcher Rechtsgrundlage wir Ihre personenbezogenen Daten mit Hilfe von Cookies verarbeiten, hängt davon ab, ob wir Sie um eine Einwilligung bitten. Falls dies zutrifft und Sie in die Nutzung von Cookies einwilligen, ist die Rechtsgrundlage der Verarbeitung Ihrer Daten die erklärte Einwilligung. Andernfalls werden die mithilfe von Cookies verarbeiteten Daten auf Grundlage unserer berechtigten Interessen (z.B. an einem betriebswirtschaftlichen Betrieb unseres Onlineangebotes und dessen Verbesserung) verarbeitet oder, wenn der Einsatz von Cookies erforderlich ist, um unsere vertraglichen Verpflichtungen zu erfüllen.</p>
                        <p><strong>Allgemeine Hinweise zum Widerruf und Widerspruch (Opt-Out): </strong> Abhängig davon, ob die Verarbeitung auf Grundlage einer Einwilligung oder gesetzlichen Erlaubnis erfolgt, haben Sie jederzeit die Möglichkeit, eine erteilte Einwilligung zu widerrufen oder der Verarbeitung Ihrer Daten durch Cookie-Technologien zu widersprechen (zusammenfassend als Opt-Out bezeichnet). Sie können Ihren Widerspruch zunächst mittels der Einstellungen Ihres Browsers erklären, z.B., indem Sie die Nutzung von Cookies deaktivieren (wobei hierdurch auch die Funktionsfähigkeit unseres Onlineangebotes eingeschränkt werden kann). Ein Widerspruch gegen den Einsatz von Cookies zu Zwecken des Onlinemarketings kann auch mittels einer Vielzahl von Diensten, vor allem im Fall des Trackings, über die Webseiten <a href="https://optout.aboutads.info" target="_blank">https://optout.aboutads.info</a> und <a href="https://www.youronlinechoices.com/" target="_blank">https://www.youronlinechoices.com/</a> erklärt werden. Daneben können Sie weitere Widerspruchshinweise im Rahmen der Angaben zu den eingesetzten Dienstleistern und Cookies erhalten.</p>
                        <p><strong>Verarbeitung von Cookie-Daten auf Grundlage einer Einwilligung</strong>: Bevor wir Daten im Rahmen der Nutzung von Cookies verarbeiten oder verarbeiten lassen, bitten wir die Nutzer um eine jederzeit widerrufbare Einwilligung. Bevor die Einwilligung nicht ausgesprochen wurde, werden allenfalls Cookies eingesetzt, die für den Betrieb unseres Onlineangebotes erforderlich sind. Deren Einsatz erfolgt auf der Grundlage unseres Interesses und des Interesses der Nutzer an der erwarteten Funktionsfähigkeit unseres Onlineangebotes.</p>
                        <ul><li><strong>Verarbeitete Datenarten:</strong> Nutzungsdaten  (z.B. besuchte Webseiten, Interesse an Inhalten, Zugriffszeiten), Meta-/Kommunikationsdaten (z.B. Geräte-Informationen, IP-Adressen).</li><li><strong>Betroffene Personen:</strong> Nutzer (z.B. Webseitenbesucher, Nutzer von Onlinediensten).</li><li><strong>Rechtsgrundlagen:</strong> Einwilligung (Art. 6 Abs. 1 S. 1 lit. a DSGVO), Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f. DSGVO).</li></ul>
                    </div>
                </section>
                <section>
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Kommerzielle und geschäftliche Leistungen</h3>
                        <p>Wir verarbeiten Daten unserer Vertrags- und Geschäftspartner, z.B. Kunden und Interessenten (zusammenfassend bezeichnet als Vertragspartner) im Rahmen von vertraglichen und vergleichbaren Rechtsverhältnissen sowie damit verbundenen Maßnahmen und im Rahmen der Kommunikation mit den Vertragspartnern (oder vorvertraglich), z.B., um Anfragen zu beantworten.</p>
                        <p>Diese Daten verarbeiten wir zur Erfüllung unserer vertraglichen Pflichten, zur Sicherung unserer Rechte und zu Zwecken der mit diesen Angaben einhergehenden Verwaltungsaufgaben sowie der unternehmerischen Organisation. Die Daten der Vertragspartner geben wir im Rahmen des geltenden Rechts nur insoweit an Dritte weiter, als dies zu den vorgenannten Zwecken oder zur Erfüllung gesetzlicher Pflichten erforderlich ist oder mit Einwilligung der Vertragspartner erfolgt (z.B. an beteiligte Telekommunikations-, Transport- und sonstige Hilfsdienste sowie Subunternehmer, Banken, Steuer- und Rechtsberater, Zahlungsdienstleister oder Steuerbehörden). Über weitere Verarbeitungsformen, z.B. zu Zwecken des Marketings, werden die Vertragspartner im Rahmen dieser Datenschutzerklärung informiert.</p>
                        <p>Welche Daten für die vorgenannten Zwecke erforderlich sind, teilen wir den Vertragspartnern vor oder im Rahmen der Datenerhebung, z.B. in Onlineformularen, durch besondere Kennzeichnung (z.B. Farben) bzw. Symbole (z.B. Sternchen o.ä.), oder persönlich mit.</p>
                        <p>Wir löschen die Daten nach Ablauf gesetzlicher Gewährleistungs- und vergleichbarer Pflichten, d.h., grundsätzlich nach Ablauf von 4 Jahren, es sei denn, dass die Daten in einem Kundenkonto gespeichert werden, z.B., solange sie aus gesetzlichen Gründen der Archivierung aufbewahrt werden müssen (z.B. für Steuerzwecke im Regelfall 10 Jahre). Daten, die uns im Rahmen eines Auftrags durch den Vertragspartner offengelegt wurden, löschen wir entsprechend den Vorgaben des Auftrags, grundsätzlich nach Ende des Auftrags.</p>
                        <p>Soweit wir zur Erbringung unserer Leistungen Drittanbieter oder Plattformen einsetzen, gelten im Verhältnis zwischen den Nutzern und den Anbietern die Geschäftsbedingungen und Datenschutzhinweise der jeweiligen Drittanbieter oder Plattformen.</p>
                        <ul className={styles.listUl}><li><strong>Verarbeitete Datenarten:</strong> Bestandsdaten (z.B. Namen, Adressen), Zahlungsdaten (z.B. Bankverbindungen, Rechnungen, Zahlungshistorie), Kontaktdaten (z.B. E-Mail, Telefonnummern), Vertragsdaten  (z.B. Vertragsgegenstand, Laufzeit, Kundenkategorie).</li><li><strong>Betroffene Personen:</strong> Interessenten, Geschäfts- und Vertragspartner.</li><li><strong>Zwecke der Verarbeitung:</strong> Vertragliche Leistungen und Service, Kontaktanfragen und Kommunikation, Büro- und Organisationsverfahren, Verwaltung und Beantwortung von Anfragen.</li><li><strong>Rechtsgrundlagen:</strong> Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1 S. 1 lit. b. DSGVO), Rechtliche Verpflichtung (Art. 6 Abs. 1 S. 1 lit. c. DSGVO), Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f. DSGVO).</li></ul>
                    </div>
                </section>
                <section className="secondary--bg">
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Blogs und Publikationsmedien</h3>
                        <p>Wir nutzen Blogs oder vergleichbare Mittel der Onlinekommunikation und Publikation (nachfolgend Publikationsmedium). Die Daten der Leser werden für die Zwecke des Publikationsmediums nur insoweit verarbeitet, als es für dessen Darstellung und die Kommunikation zwischen Autoren und Lesern oder aus Gründen der Sicherheit erforderlich ist. Im Übrigen verweisen wir auf die Informationen zur Verarbeitung der Besucher unseres Publikationsmediums im Rahmen dieser Datenschutzhinweise.</p>
                        <p><strong>Kommentare und Beiträge</strong>: Wenn Nutzer Kommentare oder sonstige Beiträge hinterlassen, können ihre IP-Adressen auf Grundlage unserer berechtigten Interessen gespeichert werden. Das erfolgt zu unserer Sicherheit, falls jemand in Kommentaren und Beiträgen widerrechtliche Inhalte hinterlässt (Beleidigungen, verbotene politische Propaganda etc.). In diesem Fall können wir selbst für den Kommentar oder Beitrag belangt werden und sind daher an der Identität des Verfassers interessiert.</p>
                        <p>Des Weiteren behalten wir uns vor, auf Grundlage unserer berechtigten Interessen die Angaben der Nutzer zwecks Spamerkennung zu verarbeiten.</p>
                        <p>Auf derselben Rechtsgrundlage behalten wir uns vor, im Fall von Umfragen die IP-Adressen der Nutzer für deren Dauer zu speichern und Cookies zu verwenden, um Mehrfachabstimmungen zu vermeiden.</p>
                        <p>Die im Rahmen der Kommentare und Beiträge mitgeteilten Informationen zur Person, etwaige Kontakt- sowie Webseiteninformationen als auch die inhaltlichen Angaben werden von uns bis zum Widerspruch der Nutzer dauerhaft gespeichert.</p>
                        <ul className={styles.listUl}><li><strong>Verarbeitete Datenarten:</strong> Bestandsdaten (z.B. Namen, Adressen), Kontaktdaten (z.B. E-Mail, Telefonnummern), Inhaltsdaten  (z.B. Texteingaben, Fotografien, Videos), Nutzungsdaten  (z.B. besuchte Webseiten, Interesse an Inhalten, Zugriffszeiten), Meta-/Kommunikationsdaten (z.B. Geräte-Informationen, IP-Adressen).</li><li><strong>Betroffene Personen:</strong> Nutzer (z.B. Webseitenbesucher, Nutzer von Onlinediensten).</li><li><strong>Zwecke der Verarbeitung:</strong> Vertragliche Leistungen und Service, Feedback (z.B. Sammeln von Feedback via Online-Formular), Sicherheitsmaßnahmen, Verwaltung und Beantwortung von Anfragen.</li><li><strong>Rechtsgrundlagen:</strong> Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1 S. 1 lit. b. DSGVO), Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f. DSGVO), Einwilligung (Art. 6 Abs. 1 S. 1 lit. a DSGVO), Schutz lebenswichtiger Interessen (Art. 6 Abs. 1 S. 1 lit. d. DSGVO).</li></ul>
                    </div>
                </section>
                <section>
                    <div className="content-inner">
                        <h3 className={`${roboto_condensed.className}`}>Kontaktaufnahme</h3>
                        <p>Bei der Kontaktaufnahme mit uns (z.B. per Kontaktformular, E-Mail, Telefon oder via soziale Medien) werden die Angaben der anfragenden Personen verarbeitet, soweit dies zur Beantwortung der Kontaktanfragen und etwaiger angefragter Maßnahmen erforderlich ist.</p>
                        <p>Die Beantwortung der Kontaktanfragen im Rahmen von vertraglichen oder vorvertraglichen Beziehungen erfolgt zur Erfüllung unserer vertraglichen Pflichten oder zur Beantwortung von (vor)vertraglichen Anfragen und im Übrigen auf Grundlage der berechtigten Interessen an der Beantwortung der Anfragen.</p>
                        <ul className={styles.listUl}><li><strong>Verarbeitete Datenarten:</strong> Bestandsdaten (z.B. Namen, Adressen), Kontaktdaten (z.B. E-Mail, Telefonnummern), Inhaltsdaten  (z.B. Texteingaben, Fotografien, Videos).</li><li><strong>Betroffene Personen:</strong> Kommunikationspartner.</li><li><strong>Zwecke der Verarbeitung:</strong> Kontaktanfragen und Kommunikation.</li><li><strong>Rechtsgrundlagen:</strong> Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1 S. 1 lit. b. DSGVO), Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f. DSGVO).</li></ul>
                    </div>
                </section>
            </main>
        </>
    )
}