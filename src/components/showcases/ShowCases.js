'use client';

import ShowBox from "@/components/showcases/ShowBox";
import ShowLogos from "@/components/showcases/ShowLogos";
import ShowPrints from "@/components/showcases/ShowPrints";
import {ranga, roboto} from "@/app/fonts";
import ShowJavascripts from "@/components/showcases/ShowJavascripts";
import ShowReact from "@/components/showcases/ShowReact";
import ShowShopware from "@/components/showcases/ShowShopware";


export default function ShowCases({cases, shopwareProjects = [], reactProjects = [], galleryItems = []}) {
    const byGallery = (g) => galleryItems.filter((it) => it.gallery === g);

    return (
        <>
            {cases === 'layouts' &&
                <>
                    <section>
                        <div className="content-inner">
                            <h2 className={`${roboto.className} is--centered`}>Design & Gestaltung</h2>
                            <p className="is--centered">Mein Ursprung als Mediengestalter: Web- und Shop-Layouts,
                                Logos und Printdesign. Dieser gestalterische Hintergrund ist die Basis dafür, dass
                                ich als Developer Design und User Experience von Anfang an mitdenke.</p>
                        </div>
                    </section>
                    <section className="secondary--bg">
                        <div className="content-inner">
                            <ShowBox
                                headline={'E-Commerce Layouts'}
                                data={byGallery('ecommerce')}
                                boxClass={'web'}
                            />
                        </div>

                    </section>
                    <section>
                        <div className="content-inner">
                            <ShowBox
                                headline={'Web Layouts'}
                                data={byGallery('website')}
                                boxClass={'web'}
                            />

                        </div>
                    </section>

                    <section className="secondary--bg">
                        <div className="content-inner">
                            <ShowLogos items={byGallery('logo')} />
                        </div>
                    </section>

                    <section>
                        <div className="content-inner">
                            <ShowPrints items={byGallery('print')} />
                        </div>
                    </section>
                </>
            }

            {cases === 'codejs' &&
                <>
                    <ShowJavascripts />
                </>
            }

            {cases === 'react' &&
                <>
                    <ShowReact projects={reactProjects} />
                </>
            }

            {cases === 'shopware' &&
                <>
                    <ShowShopware projects={shopwareProjects} />
                </>
            }
        </>
    )
}