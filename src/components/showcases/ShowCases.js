'use client';

import ShowBox from "@/components/showcases/ShowBox";
import {caseWebEntries} from "@/lib/casestudys";
import ShowLogos from "@/components/showcases/ShowLogos";
import ShowPrints from "@/components/showcases/ShowPrints";
import {ranga, roboto} from "@/app/fonts";
import ShowJavascripts from "@/components/showcases/ShowJavascripts";


export default function ShowCases({cases}) {

    return (
        <>
            {cases === 'layouts' &&
                <>
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
        </>
    )
}