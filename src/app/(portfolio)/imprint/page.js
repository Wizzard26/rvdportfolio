import HeroContent from "@/components/herocontent/page";
import {ranga, roboto, roboto_condensed} from "@/app/fonts";
import Link from "next/link";

export default function Imprint() {
    const pageName = "Imprint";

    return(
        <>
            <HeroContent
                className={`hero-container`}
                pageName={pageName}
                imgPos="top"
            />
            <main className="main-content">
                <div className="content-inner">
                    <h1 className={`${roboto.className} is--centered`}>Impressum und Informationen</h1>
                    <h2 className={`${ranga.className} is--centered`}>Rechliche Informationen</h2>
                </div>
                <section>
                    <div className="content-inner">
                        <div className={`row`}>
                            <div className={`col-12 col-md-6`}>
                                <h3 className={`${ranga.className}`}>Angaben gemäß § 5 TMG:</h3>
                                <div>Betreiber:</div>
                                <div>René van Dinter</div>
                                <div>Adresse:</div>
                                <div>Schiffertorsstrasse 22</div>
                                <div>21682 Stade</div>
                            </div>
                            <div className={`col-12 col-md-6`}>
                                <h3 className={`${ranga.className}`}>Aufgabengebiete:</h3>
                                <div>Mediengestalter Digital und Print</div>
                                <div>Web & Grafikdesigner</div>
                                <div>Frontend-Webentwickler</div>
                                <h3 className={`${ranga.className}`}>Kontaktdaten:</h3>
                                <Link href={`mailto:info@rene-van-dinter.de`} title={`Mail to me`}>info@rene-van-dinter.de</Link><br/>
                                <Link href={`https://www.rene-van-dinter.de`} title={`Mail to me`}>https://www.rene-van-dinter.de</Link>
                            </div>
                        </div>
                    </div>
                </section>
                <section className={`secondary--bg`}>
                    <div className="content-inner">
                        <h2 className={`${roboto_condensed.className}`}>Haftungsausschluß</h2>
                        <h3 className={`${ranga.className}`}>Haftung für Inhalte</h3>
                        <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
                        <p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
                    </div>
                </section>
                <section>
                    <div className="content-inner">
                        <h3 className={`${ranga.className}`}>Haftung für Links</h3>
                        <p>Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.</p>
                        <p>Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
                    </div>
                </section>
                <section className={`secondary--bg`}>
                    <div className="content-inner">
                        <h3 className={`${ranga.className}`}>Urheberrecht</h3>
                        <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.</p>
                        <p>Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>
                    </div>
                </section>
                <section>
                    <div className="content-inner">
                        <h3 className={`${ranga.className}`}>Datenschutz</h3>
                        <p>Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder eMail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben.</p>
                        <p>Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.</p>
                        <p>Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten durch Dritte zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit ausdrücklich widersprochen. Die Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung von Werbeinformationen, etwa durch Spam-Mails, vor.</p>
                        <p>Quellverweis: <Link href={`http://www.e-recht24.de/muster-disclaimer.html`} title={`e-recht24`}>eRecht24</Link></p>
                    </div>
                </section>
            </main>
        </>
    )
}