import Header from "@/components/header/page";
import Footer from "@/components/footer/page";
import HeroContent from "@/components/herocontent/page";
import Image from "next/image";
import Link from "next/link";
import { ranga, kanit, roboto, roboto_condensed } from "@/app/fonts";
import { pageContent } from "@/lib/data";
import Teaser from "@/components/teaser/page";

export default function Home() {
    const pageName = "Home"
    const pageComp = pageContent.find((page) => page.sitename === pageName);
    const teaser = pageComp.section.find((section) => section.name === "teaser");

    return (
        <>
            <Header />
            <main className="main-content">
                <HeroContent
                    className="hero-container"
                    pageName={pageName}
                />
                <Teaser
                    className="main--teaser"
                    pageName={pageName}
                />
                <section>
                    <div className="content-inner">
                        <h3 className={roboto.className}>Unter folgenden Daten können Sie Kontakt mit mir aufnehmen:</h3>
                        <div className="row contact-infos">
                            <div className="col-12 col-md-6">
                                <div className="mail-content contact-links">
                                    <span className="title">Mail:</span>
                                    <Link href="mailto:info@rene-van-dinter.de?subject=Portfolio Kontakt" title="info@rene-van-dinter.de">info@rene-van-dinter.de</Link>
                                </div>
                                <div className="phone-content contact-links">
                                    <span className="title">Tel.:</span>
                                    <Link href="tel:+491749327538" title="0174 / 93 27 538">0174 / 93 27 538</Link>
                                </div>
                            </div>
                            <div className="col-12 col-md-6 contact-button">
                                <Link href="/contact" title="Kontaktieren Sie mich" className={`${roboto_condensed.className} btn btn--secondary`}>Jetzt Schreiben</Link>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="secondary--bg">
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>Meine Aufgabengebiete</h2>
                        <div className="row my-todos">
                            <div className="card-dark col-12 col-md-6 col-lg-4">
                                <h3>Konzeption und Planung</h3>
                                <p>
                                    Projekte müssen ordentlich geplant werden. Das Zeitliche Timing, die Mitarbeiter Kapazitäten wie auch die Budget Planung entscheiden über den reibungslosen Ablauf und den erfolgreichen Abschluss.
                                </p>
                            </div>
                            <div className="card-dark col-12 col-md-6 col-lg-4">
                                <h3>Logo- & Grafikdesign</h3>
                                <p>
                                    Vom Scribble über die Konzeption bis hin zur Umsetung und der fertigen Druckdatei. Ich erstelle Gemeinsam mit meinen Kunden maßgeschneiderte Lösungen für Logo, Werbemittel und Geschäftsausstattungen.
                                </p>
                            </div>
                            <div className="card-dark col-12 col-md-6 col-lg-4">
                                <h3>UX/UI Web- & Shopdesign</h3>
                                <p>
                                    Mit einem guten Web- oder Shopdesign erreicht man seine Kunden noch besser und kann seine Effizienz steigern. Bei Beachtung der User Experience verwandelt sich eine Webseite oder ein Shop in ein Erlebnis.
                                </p>
                            </div>
                            <div className="card-dark col-12 col-md-6 col-lg-4">
                                <h3>Kommunikation</h3>
                                <p>
                                    Das erste Telefonat, Treffen beim Kick-off Meeting bis hin zum Projektabschluß. Ich begleite ein Projekt vom ersten Augenblick bis zur Fertigstellung und bleibe auch danach gerne als direkter Ansprechpartner parat.
                                </p>
                            </div>
                        </div>
                        <div className="row more-information">
                            <div className="card-light col-12 col-md-6">
                                <h3>Sie sind an einer Zusammenarbeit mit mir interessiert?</h3>
                                <p>
                                    Dann schreiben Sie mich doch einfach an und wir vereinbahren einen Termin, bei dem wir uns besser kennenlernen.
                                </p>
                                <Link href="/contact" title="Kontakt aufnehmen" className={`${roboto_condensed.className} btn btn--primary`}>Schreiben Sie mir</Link>
                            </div>
                            <div className="card-light col-12 col-md-6">
                                <h3>Sie möchten gerne ein paar Referenzen sehen?</h3>
                                <p>
                                    Schauen Sie sich in meiner Showcase um, wenn Sie noch weitere arbeiten von mir sehen wollen, kontaktieren Sie mich einfach.
                                </p>
                                <Link href="/showcase" title="Referenzen ansehen" className={`${roboto_condensed.className} btn btn--primary`}>Zur Showcase</Link>
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>News und Blogbeiträge</h2>
                        <div className="row blog-entries">
                            <div className="card-blog--entries row-reverse col-12 col-md-6">
                                <div className="card-blog--entries-image">
                                    <Image src="/img/blog/code.jpg" alt="Shopware 6" title="Arbeiten mit Shopware 6" width={600} height={600} />
                                </div>
                                <div className="card-blog--entries-textbox">
                                    <h3 className={roboto_condensed.className}>Weiterbildung Frontenddeveloper</h3>
                                    <h2 className={ranga.className}>Javascript und Certificated PHP Developer</h2>
                                    <p>Nach Jahren als Frontendentwickler für HTML/CSS, Smarty/Twig und SASS/LESS, bilde ich mich gerade weiter zum JavaScript und PHP Developer. Der Lehrgang vermittelt in je acht Wochen JavaScipt und PHP, Kenntnisse in Node, React, Vue sowie PHP, OOP, MySQLi mit anschließender Prüfung.</p>
                                    <Link href="#" className="disabled">Weiterlesen</Link>
                                </div>
                            </div>

                            <div className="card-blog--entries col-12 col-md-6">
                                <div className="card-blog--entries-image">
                                    <Image src="/img/blog/shopware6.jpg" alt="Shopware 6" title="Arbeiten mit Shopware 6" width={600} height={600} />
                                </div>
                                <div className="card-blog--entries-textbox">
                                    <h3 className={roboto_condensed.className}>Shopware 6 Template Designer</h3>
                                    <h2 className={ranga.className}>Zertifizierung in Schöppingen</h2>
                                    <p>Nach der Zertifizierung zum Shopware 5 Advanced Template Developer, war es nun an der Zeit auch die Zertifizierung zum Shopware 6 Template Designer zu machen. Neben einen tollen Lehrgangstag, war es auch ganz angenehm sich mal das Shopware Headquarter ansehen zu können.</p>
                                    <Link href="#" className="disabled">Weiterlesen</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}