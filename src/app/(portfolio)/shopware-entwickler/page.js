import Link from "next/link";
import Image from "next/image";
import { FiMapPin, FiMonitor, FiBriefcase, FiLayers } from "react-icons/fi";
import { roboto, ranga } from "@/app/fonts";
import Button from "@/components/button/Button";
import ServiceBox from "@/components/service/ServiceBox";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata, breadcrumbSchema, ogImageUrl, siteConfig } from "@/lib/seo";
import styles from "./landing.module.css";

export const metadata = pageMetadata({
    title: 'Shopware-Entwickler & Web-Entwickler (Raum Hamburg)',
    description:
        'Shopware-6- & Web-Entwickler aus Stade in der Metropolregion Hamburg – offen für eine Festanstellung, remote, hybrid oder vor Ort. Plugins, Apps, Storefront-Themes, React & Next.js.',
    path: '/shopware-entwickler',
    image: ogImageUrl('Shopware-Entwickler & Web-Entwickler', 'Raum Hamburg'),
});

// ProfilePage: sagt Suchmaschinen und LLMs, dass diese Seite das Profil von René
// beschreibt (Bezug aufs Person-Schema aus dem Layout). Zusammen mit der dortigen
// `workLocation`/Verfügbarkeit ist das der GEO-Anker für „Shopware-Entwickler
// Raum Hamburg".
const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${siteConfig.url}/shopware-entwickler/#profilepage`,
    url: `${siteConfig.url}/shopware-entwickler`,
    name: 'Shopware-Entwickler & Web-Entwickler (Raum Hamburg) – René van Dinter',
    inLanguage: siteConfig.lang,
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    about: { '@id': `${siteConfig.url}/#person` },
    mainEntity: { '@id': `${siteConfig.url}/#person` },
};

// Was ich mitbringe (Design konsistent zur Startseite über ServiceBox).
const offerings = [
    { id: 1, title: 'Shopware-6-Entwicklung', boxtext: 'Plugins, Apps und Storefront-Themes für Shopware 6 – von der Anforderung über die Umsetzung bis zur Integration externer Dienste per API.' },
    { id: 2, title: 'Frontend & Web-Apps', boxtext: 'Moderne Oberflächen und Anwendungen mit JavaScript, React und Next.js – performant, wartbar und barrierearm.' },
    { id: 3, title: 'Backend & Schnittstellen', boxtext: 'Solides Fundament mit PHP/Symfony, REST-APIs und MySQL, dazu Git und Docker für reproduzierbare, saubere Workflows.' },
    { id: 4, title: 'Design & UX', boxtext: 'Als gelernter Mediengestalter denke ich Gestaltung und Nutzersicht von Anfang an mit – Code, der technisch trägt und sich gut anfühlt.' },
];

const facts = [
    { label: 'Standort', value: 'Stade · Metropolregion Hamburg', icon: FiMapPin },
    { label: 'Arbeitsmodell', value: 'remote, hybrid oder vor Ort', icon: FiMonitor },
    { label: 'Gesucht', value: 'Festanstellung (Freelance auf Anfrage)', icon: FiBriefcase },
    { label: 'Schwerpunkte', value: 'Shopware 6 · React/Next.js · PHP/Symfony', icon: FiLayers },
];

const stack = [
    'Shopware 6', 'PHP', 'Symfony', 'Twig', 'JavaScript', 'React', 'Next.js',
    'Node.js', 'HTML', 'CSS', 'SASS', 'REST-APIs', 'MySQL', 'Git', 'Docker',
];

export default function ShopwareEntwickler() {
    return (
        <>
            <JsonLd data={[profileSchema, breadcrumbSchema([{ name: 'Shopware-Entwickler', path: '/shopware-entwickler' }])]} />
            <main className="main-content">
                {/* Teaser: Text + Foto (wie About me) */}
                <section>
                    <div className="content-inner">
                        <div className="row">
                            <div className="col-12 col-lg-7">
                                <h1 className={roboto.className}>Shopware-Entwickler &amp; Web-Entwickler – Raum Hamburg</h1>
                                <h2 className={ranga.className}>Offen für eine neue Festanstellung – remote, hybrid oder vor Ort</h2>
                                <p style={{ maxWidth: '620px' }}>
                                    Ich bin René van Dinter, <strong>Shopware-6- und Web-Entwickler</strong> aus Stade in der
                                    {' '}<strong>Metropolregion Hamburg</strong>. Mit über 15 Jahren Erfahrung aus Agentur und
                                    E-Commerce entwickle ich <strong>Shopware-6-Plugins, -Apps und -Storefront-Themes</strong> sowie
                                    moderne Web-Apps mit <strong>React und Next.js</strong> – und denke dank meines
                                    Mediengestalter-Hintergrunds Design und UX von Anfang an mit.
                                </p>
                                <div className={styles.ctaRow}>
                                    <Button href="/contact" title="Kontakt aufnehmen" style="secondary" text="Kontakt aufnehmen" />
                                </div>
                            </div>
                            <div className="col-12 col-lg-5">
                                <Image
                                    className={styles.teaserImg}
                                    src="/img/about_me.png"
                                    alt="René van Dinter – Shopware-Entwickler & Web-Entwickler aus dem Raum Hamburg"
                                    width={900}
                                    height={900}
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Was ich mitbringe */}
                <section className="secondary--bg">
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>Was ich mitbringe</h2>
                        <div className="row my-todos">
                            {offerings.map((o) => (
                                <ServiceBox key={o.id} id={o.id} title={o.title} boxtext={o.boxtext} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Verfügbarkeit auf einen Blick */}
                <section>
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>Verfügbarkeit auf einen Blick</h2>
                        <div className={styles.facts}>
                            {facts.map((f) => {
                                const Icon = f.icon;
                                return (
                                    <div className={styles.factCard} key={f.label}>
                                        <span className={styles.factIcon}><Icon aria-hidden="true" /></span>
                                        <div className={roboto.className + ' ' + styles.factLabel}>{f.label}</div>
                                        <div className={styles.factValue}>{f.value}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Warum die Zusammenarbeit passt + Tech-Stack nebeneinander */}
                <section className="secondary--bg">
                    <div className="content-inner">
                        <div className={styles.split}>
                            <div>
                                <h2 className={roboto.className}>Warum die Zusammenarbeit passt</h2>
                                <ul className={styles.reasons}>
                                    <li><strong>Über 15 Jahre Erfahrung</strong> aus Agentur und E-Commerce – als Entwickler wie in Teamleitung und Projektmanagement.</li>
                                    <li><strong>Zertifiziert:</strong> Shopware 5 Certified Template Developer, Shopware 6 Certified Template Designer, dazu Certified PHP Developer und JavaScript/React-Weiterbildungen.</li>
                                    <li><strong>Entwickler mit Designhintergrund</strong> (Mediengestalter Digital und Print, IHK) – ich verstehe Code, Design und die Sicht der Nutzer.</li>
                                    <li><strong>Sauberer, wartbarer Code</strong> nach aktuellen Standards – strukturiert und fokussiert, auch bei hohem Arbeitsaufkommen.</li>
                                </ul>
                            </div>
                            <div>
                                <h2 className={roboto.className}>Mein Tech-Stack</h2>
                                <div className={styles.stackTags}>
                                    {stack.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section>
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>Passt das zu Ihrer offenen Position?</h2>
                        <p className="is--centered" style={{ maxWidth: '760px', margin: '0 auto 28px' }}>
                            Dann freue ich mich über Ihre Nachricht. Einen Blick auf meine Arbeiten und meinen Werdegang
                            finden Sie im <Link href="/showcase">Showcase</Link> und in meiner <Link href="/vita">Vita</Link>.
                        </p>
                        <div className={styles.ctaRow} style={{ justifyContent: 'center' }}>
                            <Button href="/contact" title="Kontakt aufnehmen" style="secondary" text="Kontakt aufnehmen" />
                        </div>

                        {/* Optionaler Zusatz: die „umgekehrte Bewerbung". Abgesetzt und
                            leiser, damit es auf einer Recruiter-Seite nicht anmaßend/als
                            Ausschlusskriterium wirkt — der Ton trägt sich über den Inhalt,
                            ohne den „Witz" anzukündigen. */}
                        <div className={styles.reverseNote}>
                            <p style={{ margin: '0 0 14px', color: 'var(--dark-6)' }}>
                                Lust auf einen Perspektivwechsel? Sie dürfen sich auch gern einmal <em>bei mir</em> bewerben
                                und ein paar Fragen beantworten – kein Muss, keine Formalität, nur ein Angebot auf Augenhöhe.
                            </p>
                            <Link href="/angebot" title="Ihr Angebot an mich (umgekehrte Bewerbung)" className={styles.reverseLink}>
                                Zur umgekehrten Bewerbung →
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
