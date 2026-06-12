import {roboto} from "@/app/fonts";
import Image from "next/image";

const SIZES = "(max-width: 575px) 100vw, (max-width: 767px) 50vw, (max-width: 991px) 33vw, (max-width: 1199px) 25vw, 16vw";

const logos = [
    {src: "/img/casestudy/logo/LandhotelKirchberger1.jpg", alt: "Landhotel Kirchberger"},
    {src: "/img/casestudy/logo/medexo.jpg", alt: "Medexo"},
    {src: "/img/casestudy/logo/sannova.png", alt: "Sannova"},
    {src: "/img/casestudy/logo/tomateBasilic.jpg", alt: "Tomate Basilic"},
    {src: "/img/casestudy/logo/prinzImmo3_2.jpg", alt: "Prinz Immobilien"},
    {src: "/img/casestudy/logo/roomlab.png", alt: "Roomlab"},
    {src: "/img/casestudy/logo/Logo-Block.png", alt: "Rene van Dinter"},
    {src: "/img/casestudy/logo/tcc-logo.png", alt: "Chauffeur College"},
    {src: "/img/casestudy/logo/vita-logo.png", alt: "Vitales"},
    {src: "/img/casestudy/logo/gbsnord-logo.png", alt: "GBS Nord"},
    {src: "/img/casestudy/logo/cklix.jpg", alt: "Clix AG"},
    {src: "/img/casestudy/logo/Survival_Logo.jpg", alt: "Survival New Order"},
];

export default function ShowLogos() {
    return (
        <>
            <h2 className={`${roboto.className} is--centered`}>Logo Designs</h2>
            <div className={`row`}>
                {logos.map((logo) => (
                    <div key={logo.src} className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                        <div className={`card card-cases`}>
                            <div className={`card-image card-image-logo`}>
                                <Image src={logo.src} alt={logo.alt} width={900} height={900} sizes={SIZES}/>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
