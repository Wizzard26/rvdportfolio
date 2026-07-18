import {roboto} from "@/app/fonts";
import Image from "next/image";

const SIZES = "(max-width: 575px) 100vw, (max-width: 767px) 50vw, (max-width: 991px) 33vw, (max-width: 1199px) 25vw, 16vw";

// Print-Galerie — datengetrieben aus der Content-DB (`items`: title = Alt-Text).
export default function ShowPrints({ items = [] }) {
    return (
        <>
            <h2 className={`${roboto.className} is--centered`}>Print Designs</h2>
            <div className={`row`}>
                {items.map((print) => (
                    <div key={print.id} className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                        <div className={`card card-cases`}>
                            <div className={`card-image card-image-logo`}>
                                <Image src={print.image} alt={print.title} width={900} height={900} sizes={SIZES}
                                       unoptimized={print.image?.startsWith('/media/')}/>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
