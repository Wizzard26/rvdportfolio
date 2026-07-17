import Image from "next/image";
import {ranga, roboto, roboto_condensed} from "@/app/fonts";
import { heroContent } from "@/lib/data";
import styles from './styles.module.css';
import Button from "@/components/button/Button";

// `asMainHeading` macht die Hero-Headline zur <h1> der Seite (Subline rückt
// entsprechend auf <h2>). Nur setzen, wenn die Seite sonst keine <h1> hat —
// sonst entstehen zwei. Default ist das bisherige Verhalten (h2/h3), weil auf
// den meisten Seiten der Teaser oder der Content bereits die <h1> stellt.
export default function HeroContent({ pageName, imgPos, txtPos, asMainHeading = false}) {
    const activePage = pageName;
    const hero = heroContent.find((page) => page.sitename === activePage);
    const boxBg = hero?.textBoxBg ? styles.heroTextboxInnerWithBg : styles.heroTextboxInner;

    const Headline = asMainHeading ? 'h1' : 'h2';
    const Subline = asMainHeading ? 'h2' : 'h3';

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
                            fetchPriority="high"
                            sizes="100vw"
                            width="1920"
                            height="902" />
                    )}
                    {hero?.headline && (
                        <article className={`${textPosition}`}>
                            <div className={`${boxBg}`}>
                                <Headline className={`${roboto.className} ${styles.heroHeadline}`}>{hero?.headline}</Headline>
                                <Subline className={`${ranga.className} ${styles.heroHeadSubline}`}>{hero?.headSubline}</Subline>
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
                            </div>

                            {hero?.btnOne && (
                                <div className={`${styles.actionButtons} row`}>
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
                                </div>
                            )}
                        </article>
                    )}
                </section>
            )}
        </>
    )
}

