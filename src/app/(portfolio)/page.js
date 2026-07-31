import HeroContent from "@/components/herocontent/page";
import Link from "next/link";
import { ranga, roboto, roboto_condensed } from "@/app/fonts";
import { pageContent } from "@/lib/data";
import Teaser from "@/components/teaser/page";
import Button from "@/components/button/Button";
import ServiceBox from "@/components/service/ServiceBox";
import ContactBox from "@/components/contact/ContactBox";
import KnowledgeSection from "@/components/home/KnowledgeSection";
import HomeWow from "@/components/home/HomeWow";
import { getProjects } from "@/lib/content/showcaseStore";
import { getPosts } from "@/lib/content/postsStore";
import { getSpaces } from "@/lib/content/docSpacesStore";
import { pageMetadata, siteConfig } from "@/lib/seo";

// Dynamisch rendern: Die Startseite zeigt die neuesten Blog-Beiträge (mit ihren
// admin-editierbaren Bildern) und die Doku-Bereiche aus content.db. Bei ISR/
// statischem Prerender würde der tokenlose/leere CI-Build den Seed-Stand
// (Platzhalterbilder) einbacken und bis zur Revalidierung ausliefern. Wie
// /blog, /vita, /docs liest die Seite deshalb pro Request die echte Server-DB.
export const dynamic = 'force-dynamic';

// `absolute`, damit an den Titel der Startseite nicht noch einmal der Name
// gehängt wird ("… | René van Dinter").
export const metadata = {
    ...pageMetadata({
        title: 'René van Dinter – Shopware-Entwickler & Web-Developer aus Stade',
        description: siteConfig.description,
        path: '/',
    }),
    title: { absolute: 'René van Dinter – Shopware-Entwickler & Web-Developer aus Stade' },
};

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

    // Echte Kennzahlen für die Wow-Sektion (öffentliche Inhalte aus content.db).
    // Bei Doku zählen die BEREICHE (doc_spaces), NICHT jede einzelne Unterseite.
    const projectCount = getProjects({ publicOnly: true }).length;
    const blogCount = getPosts({ type: 'blog', publicOnly: true }).length;
    const docSpaceCount = getSpaces({ publicOnly: true }).length;
    const articleCount = blogCount + docSpaceCount;

    return (
        <>
            <main className="main-content">
                {/*
                  Die Hero-Headline ("Shopware-6- & Web-Developer mit
                  Designhintergrund") ist die aussagekräftigste Überschrift der
                  Seite und damit die <h1>. Der Teaser rückt deshalb auf <h2> —
                  seine Headline ("Moin und herzlich willkommen") ist als
                  Hauptüberschrift ohne Suchwert.
                */}
                <HeroContent
                    className="hero-container"
                    pageName={pageName}
                    asMainHeading={true}
                />
                <HomeWow years={15} projects={projectCount} articles={articleCount} />
                <Teaser
                    className="main--teaser"
                    pageName={pageName}
                    headingLevel={2}
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

                {/* Verfügbarkeit / „Hire me" — für Job-Findung (Festanstellung,
                    Raum Hamburg, remote/hybrid) und GEO. Verwebt die Ziel-Keywords
                    natürlich im Fließtext. */}
                <section>
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>Offen für neue Herausforderungen</h2>
                        <p className="is--centered" style={{ maxWidth: '820px', margin: '0 auto' }}>
                            Ich bin <strong>Shopware-Entwickler</strong> und <strong>Web-Entwickler</strong> aus Stade
                            in der <strong>Metropolregion Hamburg</strong> und offen für eine neue <strong>Festanstellung</strong>
                            {' '}– ob remote, hybrid oder vor Ort. Mein Schwerpunkt liegt auf der
                            {' '}<strong>Shopware-6-Entwicklung</strong> (Plugins, Apps und Storefront-Themes) sowie modernen
                            {' '}Web-Apps mit <strong>React und Next.js</strong>. Für passende <strong>Freelance-Projekte</strong>
                            {' '}bin ich ebenfalls ansprechbar.
                        </p>
                        <div className="home-cta-actions row" style={{ justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
                            <Button
                                href="/shopware-entwickler"
                                title="Shopware-Entwickler & Web-Entwickler – Details & Verfügbarkeit"
                                style="primary"
                                text="Entwickler gesucht? Mehr erfahren"
                            />
                            <Button
                                href="/contact"
                                title="Kontakt aufnehmen"
                                style="secondary"
                                text="Kontakt aufnehmen"
                            />
                        </div>
                    </div>
                </section>

                {/* Fachwissen & Einblicke: Blog + Dokus als Kompetenz-Beleg und
                    Absprungpunkt. Bewusst nach der Verfügbarkeit, vor der
                    umgekehrten Bewerbung. */}
                <KnowledgeSection />

                <section>
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>Möchten Sie sich meinem Bewerbungsprozess stellen?</h2>
                        <p className="is--centered" style={{ maxWidth: '760px', margin: '0 auto 28px' }}>
                            Was halten Sie von einem Perspektivwechsel? Bewerben Sie sich einfach bei mir und beantworten
                            Sie mir ein paar Fragen. Kein Muss, keine Formalität – nur ein Angebot auf Augenhöhe.
                        </p>
                        <div className="home-cta-actions row" style={{ justifyContent: 'center' }}>
                            <Button
                                href="/angebot"
                                title="Ihr Angebot an mich"
                                style="primary"
                                text="Bewerben Sie sich bei mir"
                            />
                        </div>
                    </div>
                </section>

            </main>
        </>
    )
}