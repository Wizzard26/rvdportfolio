import {roboto} from "@/app/fonts";
import TechTags from "./TechTags";
import Image from "next/image";

const SIZES = "(max-width: 575px) 100vw, (max-width: 767px) 50vw, (max-width: 991px) 33vw, (max-width: 1199px) 25vw, 16vw";

// Layout-Galerie (E-Commerce / Web). `data` = fertige Einträge einer Galerie
// (aus der Content-DB). `image` ist ein vollständiger Pfad (/img/... oder /media/...).
export default function ShowBox({headline, data = [], boxClass = 'web'}) {
    return (
        <>
            <h2 className={`${roboto.className} is--centered`}>{headline}</h2>
            <div className={`row`}>
                {data.map((entry) => (
                    <div key={entry.id} className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                        <div className={`card card-cases`}>
                            <div className={`card-image card-image-${boxClass}`}>
                                <Image src={entry.image} alt={entry.title} width={900} height={900} sizes={SIZES}
                                       unoptimized={entry.image?.startsWith('/media/')}/>
                            </div>
                            <div className={`card-content`}>
                                <h3 className={roboto.className}>{entry.title}</h3>
                                <p>{entry.description}</p>
                                <TechTags tags={entry.technik ? [entry.technik] : []} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
