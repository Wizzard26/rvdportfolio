'use client';
import {ranga, roboto} from "@/app/fonts";
import Image from "next/image";
import { pageContent } from "@/lib/data";
import { motion } from "framer-motion";

// `headingLevel` steuert, ob die Teaser-Headline die <h1> der Seite ist
// (Default) oder auf <h2> rückt. Auf 2 setzen, wenn die Seite ihre <h1> bereits
// woanders hat — z. B. auf der Startseite, wo die Hero-Headline die <h1> stellt.
export default function Teaser({pageName, className, headingLevel = 1}) {
    const pageComp = pageContent.find((page) => page.sitename === pageName);
    const teaser = pageComp.section.find((section) => section.name === "teaser");

    const Headline = headingLevel === 2 ? motion.h2 : motion.h1;
    const Subline = headingLevel === 2 ? motion.h3 : motion.h2;

    return (
        <section className={className}>
            <div className="content-inner">
                <div className="row">
                    <div className="col-12 col-lg-6">
                        <Headline className={roboto.className}
                                   initial={{opacity: '0'}}
                                   whileInView={{ opacity: '1'}}
                                   viewport={{once: true}}
                                   transition={{
                                       delay: .3,
                                       ease: "easeIn",
                                       duration: .5
                                   }}
                        >{teaser.headline}</Headline>
                        <Subline className={ranga.className}
                                   initial={{opacity: '0'}}
                                   whileInView={{ opacity: '1'}}
                                   viewport={{once: true}}
                                   transition={{
                                       delay: .5,
                                       ease: "easeIn",
                                       duration: .8
                                   }}
                        >{teaser.subline}</Subline>
                        <motion.p
                            initial={{ opacity: '0' }}
                            whileInView={{ opacity: '1' }}
                            viewport={{once: true}}
                            transition={{
                                delay: 1,
                                ease: "easeIn",
                                duration: .8
                            }}
                            dangerouslySetInnerHTML={{ __html: teaser.textBox }}/>
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