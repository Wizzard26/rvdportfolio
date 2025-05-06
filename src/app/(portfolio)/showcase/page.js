import HeroContent from "@/components/herocontent/page";
import {ranga, roboto, roboto_condensed} from "@/app/fonts";

export default function ShowCase() {
    const pageName = "Showcase";

    return(
        <>
            <HeroContent
                className={`hero-container`}
                pageName={pageName}
                imgPos="top"
                txtPos="right"
            />
            <main className="main-content">
                <section>
                    <div className="content-inner">
                        <h1 className={`${roboto_condensed.className}`}>Showcase Referenzen und Case Studys</h1>
                        <div className={`row`}>
                            <div className={`col-12 col-md-6`}>
                                <h3 className={`${ranga.className}`}>Referenzen, Auftragsarbeiten und Fingerübungen</h3>
                                <p>Hier finden Sie arbeiten, welche ich in den letzten Jahren angefertigt habe. Diese
                                    enstanden für Wettbewerbe, freie Mitarbeit bei verschiedenen Agenturen, sowie in
                                    meiner Festanstellung als Frontend-Entwickler.</p>
                                <p>Die Sammlung besteht sowohl aus Auftragsarbeiten wie auch aus arbeiten welche einfach
                                    nur zu eigenen Trainingszwecke erstellt wurden.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="secondary--bg">
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>E-Commerce Referenzen</h2>
                        <div className={`row`}>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-web`}>
                                        <img src="/img/casestudy/web/DarkGold.jpg" alt="Shopware Theme" width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-web`}>
                                        <img src="/img/casestudy/web/smarthome_start.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-web`}>
                                        <img src="/img/casestudy/web/Rauchbar_start.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-web`}>
                                        <img src="/img/casestudy/web/weblayoutgrill.png" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-web`}>
                                        <img src="/img/casestudy/web/darttheme.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-web`}>
                                        <img src="/img/casestudy/web/bombfroglayout.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
                <section>
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>Web Referenzen</h2>
                        <div className={`row`}>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-web`}>
                                        <img src="/img/casestudy/web/demoagency.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-web`}>
                                        <img src="/img/casestudy/web/limoservice.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-web`}>
                                        <img src="/img/casestudy/web/mensakeller.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-web`}>
                                        <img src="/img/casestudy/web/gambit24_prev.png" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-web`}>
                                        <img src="/img/casestudy/web/Faircollect.png" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-web`}>
                                        <img src="/img/casestudy/web/gbs-web.png" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                <section className="secondary--bg">
                    <div className="content-inner">
                        <h2 className={`${roboto.className} is--centered`}>Logo Referenzen</h2>
                        <div className={`row`}>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-logo`}>
                                        <img src="/img/casestudy/logo/LandhotelKirchberger1.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-logo`}>
                                        <img src="/img/casestudy/logo/medexo.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-logo`}>
                                        <img src="/img/casestudy/logo/sannova.png" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-logo`}>
                                        <img src="/img/casestudy/logo/tomateBasilic.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-logo`}>
                                        <img src="/img/casestudy/logo/prinzImmo3_2.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-logo`}>
                                        <img src="/img/casestudy/logo/roomlab.png" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-logo`}>
                                        <img src="/img/casestudy/logo/Logo-Block.png" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-logo`}>
                                        <img src="/img/casestudy/logo/tcc-logo.png" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-logo`}>
                                        <img src="/img/casestudy/logo/vita-logo.png" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-logo`}>
                                        <img src="/img/casestudy/logo/gbsnord-logo.png" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-logo`}>
                                        <img src="/img/casestudy/logo/cklix.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                                <div className={`card card-cases`}>
                                    <div className={`card-image card-image-logo`}>
                                        <img src="/img/casestudy/logo/Survival_Logo.jpg" alt="Shopware Theme"
                                             width={900}
                                             height={900}/>
                                    </div>
                                    <div className={`card-content`}>
                                        <h3 className={roboto.className}>Projekt 1</h3>
                                        <p>Projektbeschreibung</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

            </main>
        </>
    )
}