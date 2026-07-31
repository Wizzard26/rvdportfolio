import {ranga, roboto} from "@/app/fonts";
import Image from "next/image";
import { pageContent } from "@/lib/data";
import Reveal from "@/components/reveal/Reveal";

// `headingLevel` steuert, ob die Teaser-Headline die <h1> der Seite ist
// (Default) oder auf <h2> rückt. Auf 2 setzen, wenn die Seite ihre <h1> bereits
// woanders hat — z. B. auf der Startseite, wo die Hero-Headline die <h1> stellt.
// `afterText` ist ein optionaler Slot, der in der linken Spalte UNTER dem
// Fließtext (also neben dem Bild) gerendert wird — z. B. das Profil-Terminal auf
// /about-me. Andere Seiten übergeben ihn nicht und bleiben unverändert.
export default function Teaser({pageName, className, headingLevel = 1, afterText = null}) {
    const pageComp = pageContent.find((page) => page.sitename === pageName);
    const teaser = pageComp.section.find((section) => section.name === "teaser");

    const HeadlineTag = headingLevel === 2 ? 'h2' : 'h1';
    const SublineTag = headingLevel === 2 ? 'h3' : 'h2';

    return (
        <section className={className}>
            <div className="content-inner">
                <div className="row">
                    <div className="col-12 col-lg-6">
                        <Reveal as={HeadlineTag} className={roboto.className} delay={0.1}>{teaser.headline}</Reveal>
                        <Reveal as={SublineTag} className={ranga.className} delay={0.25}>{teaser.subline}</Reveal>
                        <Reveal as="p" delay={0.4} dangerouslySetInnerHTML={{ __html: teaser.textBox }} />
                        {afterText}
                    </div>
                    {teaser.imageUrl &&
                        <div className="col-12 col-lg-6">
                            <Image className="content-float-svg" src={teaser.imageUrl} alt={teaser.imageAlt} width={900} height={900} />
                        </div>
                    }
                </div>
            </div>
        </section>
    )
}
