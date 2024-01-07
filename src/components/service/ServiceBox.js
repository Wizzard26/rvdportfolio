'use client';
import {roboto_condensed} from "@/app/fonts";
import { motion } from "framer-motion";

export default function ServiceBox({id, title, boxtext}) {
    return (
        <>
            <motion.div
                className="card-dark col-12 col-md-6 col-lg-6 col-xl-3"
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
                <h3 className={`${roboto_condensed.className}`}>{title}</h3>
                <p>{boxtext} </p>
            </motion.div>
        </>
    )
}