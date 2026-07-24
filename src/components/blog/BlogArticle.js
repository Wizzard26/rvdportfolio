import styles from "@/app/(portfolio)/blog/styles.module.css";
import Link from "next/link";
import Image from "next/image";
import {ranga, roboto} from "@/app/fonts";
import Reveal from "@/components/reveal/Reveal";

// Bildpfad: Uploads liegen als absoluter /media/…-Pfad vor, Alt-Bilder als
// bloßer Dateiname unter /img/blog/. Kein Bild → Platzhalter.
function imageSrc(image) {
    if (!image) return '/img/blog/no-image.jpg';
    return image.startsWith('/') ? image : `/img/blog/${image}`;
}

export default function BlogArticle ({blogEntry, button = false, articleCols = 'col-12', index}) {
    return (
        <Reveal
            delay={Math.min((index - 1) * 0.08, 0.32)}
            className={`${styles.blogEntryBox} ${articleCols} `} >
            <div className={`${styles.blogImageContainer}`}>
                <Link className={styles.blogImageLink} href={`/blog/${blogEntry.slug}`} >
                    <Image className={`${styles.blogEntryImage}`} src={imageSrc(blogEntry.image)} title={`${blogEntry.title}`} width={640} height={360} alt={`${blogEntry.title}`} />
                </Link>
            </div>

            <div className={`${styles.blogEntryTextBox}`} >
                <Link href={`/blog/${blogEntry.slug}`} className="blog-title"><h2 className={roboto.className}>{blogEntry.title}</h2></Link>
                <h3 className={ranga.className}>{blogEntry.subline}</h3>
                <p className={styles.blogTeaser}>{blogEntry.teaser}</p>
                { button &&
                    <Link href={`/blog/${blogEntry.slug}`}>Weiterlesen</Link>
                }
            </div>
        </Reveal>
    )
}
