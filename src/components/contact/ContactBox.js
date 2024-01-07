'use client';
import {ranga} from "@/app/fonts";
import Button from "@/components/button/Button";
import { motion } from "framer-motion";

export default function ContactBox({id, name, boxtext, link, linktitle, linktext, style}) {
    return (
        <>
            <motion.div
                className="card-light col-12 col-md-6"
                key={id}
                initial={{opacity: '0'}}
                whileInView={{ opacity: '1'}}
                viewport={{once: true}}
                transition={{
                    delay: .3 * id,
                    ease: "easeIn",
                    duration: .5
                }}
            >
                <h3 className={`${ranga.className}`}>{name}</h3>
                <p>
                    {boxtext}
                </p>
                <Button
                    href={link}
                    title={linktitle}
                    style={style}
                    text={linktext}
                />
            </motion.div>
        </>
    )
}