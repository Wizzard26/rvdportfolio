import Header from "@/components/header/page";
import Footer from "@/components/footer/page";
import HeroContent from "@/components/herocontent/page";
import Image from "next/image";
import Link from "next/link";
import { ranga, kanit, roboto, roboto_condensed } from "@/app/fonts";
import { pageContent } from "@/lib/data";
import Teaser from "@/components/teaser/page";
import Button from "@/components/button/Button";

const getData = (pageComp, sectionData) => {
    const pageData = pageComp.section.find((section) => section.name === `${sectionData}`);
    return pageData;
}

export default function Home() {
    const pageName = "Home"
    const pageComp = pageContent.find((page) => page.sitename === pageName);
    const conData = getData(pageComp, 'contactinfo');
    const todos = getData(pageComp, 'todos');
    const moreinfo = getData(pageComp, 'moreinfo');
    const todoData= todos.cards;
    const moreinfoData= moreinfo.boxes;


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
                        <h3 className={roboto.className}>{ conData.headline }</h3>
                        <div className="row contact-infos">
                            <div className="col-12 col-md-6">
                                <div className="mail-content contact-links">
                                    <span className="title">{ conData.maillabel }</span>
                                    <Link href={ conData.maillink } title={ conData.mailtitle }>{ conData.mail }</Link>
                                </div>
                                <div className="phone-content contact-links">
                                    <span className="title">{ conData.tellabel }</span>
                                    <Link href={ conData.tellink } title={ conData.teltitle }>{ conData.tel }</Link>
                                </div>
                            </div>
                            <div className="col-12 col-md-6 contact-button">
                                <Button
                                    href={ conData.contactbtnlink }
                                    title={ conData.contactbtntitle }
                                    style="secondary"
                                    text={ conData.contactbtn }
                                />
                            </div>
                        </div>
                    </div>
                </section>
                <section className="secondary--bg">
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>Meine Aufgabengebiete</h2>
                        <div className="row my-todos">
                            {todoData.map((card) => (
                                <div className="card-dark col-12 col-md-6 col-lg-6 col-xl-3" key={todoData.id}>
                                    <h3>{card.name}</h3>
                                    <p>{card.boxtext} </p>
                                </div>
                            ))}
                        </div>
                        <div className="row more-information">
                            {moreinfoData.map((box) => (
                                <div className="card-light col-12 col-md-6" key={moreinfoData.id}>
                                    <h3>{box.name}</h3>
                                    <p>
                                        {box.boxtext}
                                    </p>
                                    <Button
                                        href={box.link}
                                        title={box.linktitle}
                                        style="primary"
                                        text={box.linktext}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section>
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>News und Blogbeiträge</h2>
                        <div className="row blog-entries blog-teaser">
                            <div className="card-blog--entries row-reverse col-12 col-xl-6">
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

                            <div className="card-blog--entries col-12 col-xl-6">
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
                        <div className="blog-teaser-actions row">
                            <div className="col-6 align-right">
                                <Button
                                    href="/blog"
                                    title="Weitere Beiträge lesen"
                                    style="secondary"
                                    text="Weitere Beiträge"
                                />
                            </div>
                            <div className="col-6">
                                <Button
                                    href="/contact"
                                    title="Kontaktieren"
                                    style="primary"
                                    text="Kontakt Aufnehmen"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}