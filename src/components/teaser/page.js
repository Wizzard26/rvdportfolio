'use client';
import {ranga, roboto} from "@/app/fonts";
import Image from "next/image";
import { pageContent } from "@/lib/data";
import { motion } from "framer-motion";

export default function Teaser({pageName, className}) {
    const pageComp = pageContent.find((page) => page.sitename === pageName);
    const teaser = pageComp.section.find((section) => section.name === "teaser");
    return (
        <section className={className}>
            <div className="content-inner">
                <div className="row">
                    <div className="col-12 col-lg-6">
                        <motion.h1 className={roboto.className}
                                   initial={{opacity: '0'}}
                                   whileInView={{ opacity: '1'}}
                                   viewport={{once: true}}
                                   transition={{
                                       delay: .3,
                                       ease: "easeIn",
                                       duration: .5
                                   }}
                        >{teaser.headline}</motion.h1>
                        <motion.h2 className={ranga.className}
                                   initial={{opacity: '0'}}
                                   whileInView={{ opacity: '1'}}
                                   viewport={{once: true}}
                                   transition={{
                                       delay: .5,
                                       ease: "easeIn",
                                       duration: .8
                                   }}
                        >{teaser.subline}</motion.h2>
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