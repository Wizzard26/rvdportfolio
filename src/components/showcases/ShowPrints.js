import {roboto} from "@/app/fonts";
import Image from "next/image";

const SIZES = "(max-width: 575px) 100vw, (max-width: 767px) 50vw, (max-width: 991px) 33vw, (max-width: 1199px) 25vw, 16vw";

const prints = [
    {src: "/img/casestudy/print/cascade.png", alt: "Cascade Darts"},
    {src: "/img/casestudy/print/dr_reiser.png", alt: "Reiser Ärzte"},
    {src: "/img/casestudy/print/EWS_Windenergy.png", alt: "EWS Windenergy"},
    {src: "/img/casestudy/print/flyerKleineKneipe.png", alt: "Andres kleine Kneipe"},
    {src: "/img/casestudy/print/gbs_nord.webp", alt: "GBS Nord"},
    {src: "/img/casestudy/print/woznyCD.jpg", alt: "Wozny Photography"},
];

export default function ShowPrints() {
    return (
        <>
            <h2 className={`${roboto.className} is--centered`}>Print Designs</h2>
            <div className={`row`}>
                {prints.map((print) => (
                    <div key={print.src} className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                        <div className={`card card-cases`}>
                            <div className={`card-image card-image-logo`}>
                                <Image src={print.src} alt={print.alt} width={900} height={900} sizes={SIZES}/>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
