import styles from "@/app/(portfolio)/blog/styles.module.css";
import Link from "next/link";
import Image from "next/image";
import {ranga, roboto} from "@/app/fonts";

export default function BlogArticle ({blogEntry ,author= false, tags = false , button = false, articleCols = 'col-12'}) {
    return (
        <article className={`${styles.blogEntryBox} ${articleCols} `} >
            <Link className={styles.blogImageLink} href={`/blog/${blogEntry.slug}`} >
                <Image className={`${styles.blogEntryImage}`} src={`/img/blog/${blogEntry.image ? blogEntry.image : 'no-image.jpg'}`} title={`${blogEntry.title}`} width={200} height={200} alt={`${blogEntry.title}`} />
            </Link>
            {author &&
                <div className={styles.blogAuthorInfo}>{blogEntry.date} from: {blogEntry.author}</div>
            }
            {tags &&
                <div className={styles.blogTagList}>
                    {blogEntry.category.map((blogTag, index) => (
                        <span className={styles.blogTag} key={index}><Link href={`/blog/?cat=${blogTag}`}>{blogTag}</Link></span>
                    ))}
                </div>
            }

            <div className={`${styles.blogEntryTextBox}`} >
                <Link href={`/blog/${blogEntry.slug}`} className="blog-title"><h2 className={roboto.className}>{blogEntry.title}</h2></Link>
                <h3 className={ranga.className}>{blogEntry.subline}</h3>
                <p>{blogEntry.teaser}</p>
                { button &&
                    <Link href={`/blog/${blogEntry.slug}`}>Weiterlesen</Link>
                }
            </div>
        </article>
    )
}