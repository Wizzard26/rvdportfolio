import Image from "next/image";
import {ranga, roboto, roboto_condensed} from "@/app/fonts";
import { heroContent } from "@/lib/data";
import styles from './styles.module.css'
import Link from "next/link";

export default function HeroContent({ pageName, imgPos, txtPos}) {
    const activePage = pageName;
    const hero = heroContent.find((page) => page.sitename === activePage);
    const boxBg = hero?.textBoxBg ? styles.heroTextboxInnerWithBg : styles.heroTextboxInner;

    const textPosition = txtPos === "left" ? styles.heroTextboxLeft : styles.heroTextbox;

    let position;

    switch (imgPos) {
        case "top" :
            position = styles.heroImgTop;
            break;
        case "center" :
            position = styles.heroImgCenter;
            break;
        case "bottom" :
            position = styles.heroImgBottom;
            break;
        default :
            position = styles.heroImgCenter;
            break;
    }


    return (
        <>
            {(hero?.imgUrl || hero?.headline) && (
                <section className={`${styles.heroContainer}`}>
                    {hero?.imgUrl && (
                        <Image
                            className={`${styles.heroContainerImg} ${position}`}
                            src={hero?.imgUrl}
                            alt={hero?.imgAlt}
                            width="1920"
                            height="902" />
                    )}
                    {hero?.headline && (
                        <article className={`${textPosition}`}>
                            <div className={`${boxBg}`}>
                                <h2 className={`${roboto.className} ${styles.heroHeadline}`}>{hero?.headline}</h2>
                                <h3 className={`${ranga.className} ${styles.heroHeadSubline}`}>{hero?.headSubline}</h3>
                                <p className={`${styles.heroListHeadline}`}>{hero?.listHeadline}</p>

                                {hero?.list && (
                                    <ul className={styles.heroList}>
                                        {hero?.list.map((item, index) => (
                                            <li key={index}>{item}</li>
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
                                    <Link href={hero?.btnOne.url}
                                          title={hero?.btnOne.title}
                                          className={`${roboto_condensed.className} btn ${hero?.btnOne.style ? 'btn--' + hero.btnOne.style : 'btn--secondary-full' }`}>
                                        {hero?.btnOne.text}
                                    </Link>
                                    {hero?.btnTwo && (
                                        <Link href={hero?.btnTwo.url}
                                              title={hero?.btnTwo.title}
                                              className={`${roboto_condensed.className} btn ${hero?.btnTwo.style ? 'btn--' + hero.btnTwo.style : 'btn--primary' }`}>
                                            {hero?.btnTwo.text}
                                        </Link>
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

