'use client';

import ShowBox from "@/components/showcases/ShowBox";
import {caseWebEntries} from "@/lib/casestudys";
import ShowLogos from "@/components/showcases/ShowLogos";
import ShowPrints from "@/components/showcases/ShowPrints";
import {ranga, roboto} from "@/app/fonts";
import ShowJavascripts from "@/components/showcases/ShowJavascripts";
import ShowReact from "@/components/showcases/ShowReact";
import ShowShopware from "@/components/showcases/ShowShopware";


export default function ShowCases({cases}) {

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
                                data={caseWebEntries}
                                boxClass={'web'}
                                category={'eCommerce'}
                            />
                        </div>

                    </section>
                    <section>
                        <div className="content-inner">
                            <ShowBox
                                headline={'Web Layouts'}
                                data={caseWebEntries}
                                boxClass={'web'}
                                category={'website'}
                            />

                        </div>
                    </section>

                    <section className="secondary--bg">
                        <div className="content-inner">
                            <ShowLogos />
                        </div>
                    </section>

                    <section>
                        <div className="content-inner">
                            <ShowPrints/>
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
                    <ShowReact />
                </>
            }

            {cases === 'shopware' &&
                <>
                    <ShowShopware />
                </>
            }
        </>
    )
}