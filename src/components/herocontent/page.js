import Image from "next/image";
import {ranga, roboto} from "@/app/fonts";
import {heroContent} from "@/lib/data";
import styles from './styles.module.css'

export default function HeroContent({ className, pageName, imgPos}) {
    const activePage = pageName;
    const hero = heroContent.find((page) => page.sitename === activePage);
    const boxBg = hero?.textBoxBg ? 'hero-textbox with--bg' : 'hero-textbox';

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
                <section className={className}>
                    {hero?.imgUrl && (
                        <Image
                            className={position}
                            src={hero?.imgUrl}
                            alt={hero?.imgAlt}
                            width="1920"
                            height="902" />
                    )}
                    {hero?.headline && (
                        <article className={`${boxBg}`}>
                            <div className="text--inner">
                                <h2 className={roboto.className}>{hero?.headline}</h2>
                                <h3 className={ranga.className}>{hero?.headSubline}</h3>
                                <p>{hero?.listHeadline}</p>

                                {hero?.list && (
                                    <ul>
                                        {hero?.list.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                )}

                                {hero?.textbox && (
                                    <>
                                        <p dangerouslySetInnerHTML={{ __html: hero?.textbox }}/>
                                    </>
                                )}
                            </div>


                        </article>
                    )}

                </section>
            )}
        </>
    )
}

