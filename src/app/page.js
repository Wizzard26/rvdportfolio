import HeroContent from "@/components/herocontent/page";
import Link from "next/link";
import { ranga, roboto, roboto_condensed } from "@/app/fonts";
import { pageContent } from "@/lib/data";
import Teaser from "@/components/teaser/page";
import Button from "@/components/button/Button";
import BlogList from "@/components/blog/BlogList";
import ServiceBox from "@/components/service/ServiceBox";
import ContactBox from "@/components/contact/ContactBox";

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
                                <ServiceBox
                                    key={card.id}
                                    id={card.id}
                                    title={card.name}
                                    boxtext={card.boxtext}
                                />
                            ))}
                        </div>
                        <div className="row more-information">
                            {moreinfoData.map((box) => (
                                <ContactBox
                                    key={box.id}
                                    id={box.id}
                                    name={box.name}
                                    boxtext={box.boxtext}
                                    link={box.link}
                                    linktitle={box.linktitle}
                                    linktext={box.linktext}
                                    style="primary"
                                />
                            ))}
                        </div>
                    </div>
                </section>
                {/*
                <section>
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>News und Blogbeiträge</h2>
                        <BlogList
                            author={false}
                            tags={false}
                            button={true}
                            limit={2}
                            pagination={false}
                            articleCols={'card-blog--entries col-12 col-xl-6'}
                        />
                        <div className="blog-teaser-actions row">
                            <div className="col-12 col-md-6 align-center align-md-right">
                                <Button
                                    href="/blog"
                                    title="Weitere Beiträge lesen"
                                    style="primary"
                                    text="Alle Beiträge Lesen"
                                />
                            </div>
                            <div className="col-12 col-md-6 align-center align-md-left">
                                <Button
                                    href="/contact"
                                    title="Kontaktieren"
                                    style="secondary-full"
                                    text="Nachricht Schreiben"
                                />
                            </div>
                        </div>
                    </div>
                </section>
                */}

                <section>
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>Sie haben Interesse an ein Gespräch ?</h2>
                        <div className="col-12  align-center">
                            <Button
                                href="/contact"
                                title="Kontaktieren"
                                style="secondary-full"
                                text="Nachricht Schreiben"
                            />
                        </div>
                    </div>
                </section>

            </main>
        </>
    )
}