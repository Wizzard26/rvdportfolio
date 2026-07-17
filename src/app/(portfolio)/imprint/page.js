import HeroContent from "@/components/herocontent/page";
import {ranga, roboto, roboto_condensed} from "@/app/fonts";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
    title: 'Impressum',
    description:
        'Impressum und Anbieterkennzeichnung gemäß § 5 DDG für rene-van-dinter.de – René van Dinter, Shopware- & Web-Developer aus Stade.',
    path: '/imprint',
});

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
                    <h2 className={`${ranga.className} is--centered`}>Rechtliche Informationen</h2>
                </div>
                <section>
                    <div className="content-inner">
                        <div className={`row`}>
                            <div className={`col-12 col-md-6`}>
                                <h3 className={`${ranga.className}`}>Angaben gemäß § 5 DDG:</h3>
                                <div>Betreiber:</div>
                                <div>René van Dinter</div>
                                <div>Adresse:</div>
                                <div>Schiffertorsstrasse 22</div>
                                <div>21682 Stade</div>
                            </div>
                            <div className={`col-12 col-md-6`}>
                                <h3 className={`${ranga.className}`}>Aufgabengebiete:</h3>
                                <div>Shopware- & Web-Development</div>
                                <div>Frontend- & Web-App-Entwicklung</div>
                                <div>Mediengestaltung (Digital & Print)</div>
                                <h3 className={`${ranga.className}`}>Kontaktdaten:</h3>
                                <div>Telefon: <Link href={`tel:+491749327538`} title={`Anrufen`}>0174 / 93 27 538</Link></div>
                                <Link href={`mailto:info@rene-van-dinter.de`} title={`E-Mail schreiben`}>info@rene-van-dinter.de</Link><br/>
                                <Link href={`https://www.rene-van-dinter.de`} title={`Zur Website`}>https://www.rene-van-dinter.de</Link>
                            </div>
                        </div>
                    </div>
                </section>
                <section className={`secondary--bg`}>
                    <div className="content-inner">
                        <h2 className={`${roboto_condensed.className}`}>Haftungsausschluss</h2>
                        <h3 className={`${ranga.className}`}>Haftung für Inhalte</h3>
                        <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
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
                        <p>Informationen zum Umgang mit personenbezogenen Daten auf dieser Website finden Sie in unserer <Link href={`/disclaimer`} title={`Zur Datenschutzerklärung`}>Datenschutzerklärung</Link>.</p>
                        <p>Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit ausdrücklich widersprochen.</p>
                    </div>
                </section>
            </main>
        </>
    )
}