import {ranga, roboto} from "@/app/fonts";
import Image from "next/image";
import { pageContent } from "@/lib/data";

export default function Teaser({pageName, className}) {
    const pageComp = pageContent.find((page) => page.sitename === pageName);
    const teaser = pageComp.section.find((section) => section.name === "teaser");
    return (
        <section className={className}>
            <div className="content-inner">
                <div className="row">
                    <div className="col-12 col-lg-6">
                        <h1 className={roboto.className}>{teaser.headline}</h1>
                        <h2 className={ranga.className}>{teaser.subline}</h2>
                        <p dangerouslySetInnerHTML={{ __html: teaser.textBox }}/>
                    </div>
                    <div className="col-12 col-lg-6">
                        <Image className="content-float-svg" src={teaser.imageUrl} alt={teaser.imageAlt} width={900} height={900} />
                    </div>
                </div>
            </div>
        </section>
    )
}