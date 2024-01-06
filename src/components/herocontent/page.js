"use client";
import Image from "next/image";
import {ranga, roboto, roboto_condensed} from "@/app/fonts";
import { heroContent } from "@/lib/data";
import styles from './styles.module.css';
import Button from "@/components/button/Button";
import { motion } from "framer-motion";

export default function HeroContent({ pageName, imgPos, txtPos}) {
    const activePage = pageName;
    const hero = heroContent.find((page) => page.sitename === activePage);
    const boxBg = hero?.textBoxBg ? styles.heroTextboxInnerWithBg : styles.heroTextboxInner;

    const textPosition = txtPos === "left" ? styles.heroTextboxLeft : styles.heroTextbox;

    const positionMap = {
        top: styles.heroImgTop,
        center: styles.heroImgCenter,
        bottom: styles.heroImgBottom
    };

    const position = positionMap[imgPos] || styles.heroImgCenter;

    return (
        <>
            {(hero?.imgUrl || hero?.headline) && (
                <section className={`${styles.heroContainer}`}>
                    {hero?.imgUrl && (
                        <Image
                            className={`${styles.heroContainerImg} ${position}`}
                            src={hero?.imgUrl}
                            alt={hero?.imgAlt}
                            priority={true}
                            width="1920"
                            height="902" />
                    )}
                    {hero?.headline && (
                        <article className={`${textPosition}`}>
                            <motion.div className={`${boxBg}`}
                                        initial={{opacity: 0}}
                                        whileInView={{ opacity: 1 }}
                                        transition={{
                                            delay: .5,
                                            ease: "easeIn",
                                            duration: .5
                                        }}
                                        viewport={{once: true}}
                            >
                                <h2 className={`${roboto.className} ${styles.heroHeadline}`}>{hero?.headline}</h2>
                                <h3 className={`${ranga.className} ${styles.heroHeadSubline}`}>{hero?.headSubline}</h3>
                                <p className={`${styles.heroListHeadline}`}>{hero?.listHeadline}</p>

                                {hero?.list && (
                                    <ul className={styles.heroList}>
                                        {hero?.list.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                )}

                                {hero?.textbox && (
                                    <>
                                        <p className={`${styles.heroText}`} dangerouslySetInnerHTML={{ __html: hero?.textbox }}/>
                                    </>
                                )}
                            </motion.div>

                            {hero?.btnOne && (
                                <motion.div className={`${styles.actionButtons} row`}
                                            initial={{opacity: 0}}
                                            whileInView={{ opacity: 1 }}
                                            transition={{
                                                delay: 1,
                                                ease: "easeIn",
                                                duration: .5
                                            }}
                                            viewport={{once: true}}
                                >
                                    <Button
                                        href={hero?.btnOne.url}
                                        title={hero?.btnOne.title}
                                        style={hero.btnOne.style}
                                        text={hero?.btnOne.text}
                                    />
                                    {hero?.btnTwo && (
                                        <Button
                                            href={hero?.btnTwo.url}
                                            title={hero?.btnTwo.title}
                                            style={hero.btnTwo.style}
                                            text={hero?.btnTwo.text}
                                        />
                                    )}
                                </motion.div>
                            )}
                        </article>
                    )}
                </section>
            )}
        </>
    )
}

