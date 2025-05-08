import {roboto} from "@/app/fonts";

export default function ShowPrints() {
    return (
        <>
            <h2 className={`${roboto.className} is--centered`}>Print Designs</h2>
            <div className={`row`}>

                <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                    <div className={`card card-cases`}>
                        <div className={`card-image card-image-logo`}>
                            <img src="/img/casestudy/print/cascade.png"
                                 alt="Cascade Darts"
                                 width={900}
                                 height={900}/>
                        </div>
                    </div>
                </div>

                <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                    <div className={`card card-cases`}>
                        <div className={`card-image card-image-logo`}>
                            <img src="/img/casestudy/print/dr_reiser.png"
                                 alt="Reiser Ärzte"
                                 width={900}
                                 height={900}/>
                        </div>
                    </div>
                </div>
                <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                    <div className={`card card-cases`}>
                        <div className={`card-image card-image-logo`}>
                            <img src="/img/casestudy/print/EWS_Windenergy.png"
                                 alt="EWS Windenergy"
                                 width={900}
                                 height={900}/>
                        </div>
                    </div>
                </div>
                <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                    <div className={`card card-cases`}>
                        <div className={`card-image card-image-logo`}>
                            <img src="/img/casestudy/print/flyerKleineKneipe.png"
                                 alt="Andres kleine Kneipe"
                                 width={900}
                                 height={900}/>
                        </div>
                    </div>
                </div>

                <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                    <div className={`card card-cases`}>
                        <div className={`card-image card-image-logo`}>
                            <img src="/img/casestudy/print/gbs_nord.webp"
                                 alt="Gbs Nord"
                                 width={900}
                                 height={900}/>
                        </div>
                    </div>
                </div>

                <div className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                    <div className={`card card-cases`}>
                        <div className={`card-image card-image-logo`}>
                            <img src="/img/casestudy/print/woznyCD.jpg"
                                 alt="Wozny Photography"
                                 width={900}
                                 height={900}/>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}