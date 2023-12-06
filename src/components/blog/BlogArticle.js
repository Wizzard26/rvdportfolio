import styles from "@/app/(portfolio)/blog/styles.module.css";
import Link from "next/link";
import Image from "next/image";
import {ranga, roboto} from "@/app/fonts";
import {MotionDiv} from "@/components/MotionDiv/MotionDiv";

const variants = {
    hidden: { opacity:0 },
    visible: { opacity: 1 },
};

export default function BlogArticle ({blogEntry ,author= false, tags = false , button = false, articleCols = 'col-12', index}) {

    return (
        <MotionDiv
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{
                delay: index * 0.25,
                ease: "easeInOut",
                duration: 0.5,
            }}
            viewport={{ amount: 0}}
            className={`${styles.blogEntryBox} ${articleCols} `} >
            <div className={`${styles.blogImageContainer}`}>
                <Link className={styles.blogImageLink} href={`/blog/${blogEntry.slug}`} >
                    <Image className={`${styles.blogEntryImage}`} src={`/img/blog/${blogEntry.image ? blogEntry.image : 'no-image.jpg'}`} title={`${blogEntry.title}`} width={200} height={200} alt={`${blogEntry.title}`} />
                </Link>
                {tags &&
                    <div className={styles.blogTagList}>
                        {blogEntry.category.map((blogTag, index) => (
                            <span className={styles.blogTag} key={index}><Link href={`/blog/?cat=${blogTag}`}>{blogTag}</Link></span>
                        ))}
                    </div>
                }
            </div>

            {author &&
                <div className={styles.blogAuthorInfo}>{blogEntry.date} from: {blogEntry.author}</div>
            }


            <div className={`${styles.blogEntryTextBox}`} >
                <Link href={`/blog/${blogEntry.slug}`} className="blog-title"><h2 className={roboto.className}>{blogEntry.title}</h2></Link>
                <h3 className={ranga.className}>{blogEntry.subline}</h3>
                <p>{blogEntry.teaser}</p>
                { button &&
                    <Link href={`/blog/${blogEntry.slug}`}>Weiterlesen</Link>
                }
            </div>
        </MotionDiv>
    )
}