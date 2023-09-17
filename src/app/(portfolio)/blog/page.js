import { blogEntries } from "@/lib/data";
import Link from "next/link";
import styles from "./styles.module.css";
import Image from "next/image";

// TODO add Hero and teaser section
// TODO add more blog entries
// TODO add Blog routing for single page entries
// TODO add pagination maximum entries on one site
// TODO add styling for blog page
// TODO set all relevated links, from main page and to single page

// TODO feature add sidebar and categorylist
// TODO feature add filter by category and more
// TODO add author or / and date for entry


export default function Blog() {

    return(
        <>
            <main className="main-content">
                <section>
                    <div className="content-inner">
                        <h1>Here comes blog entries</h1>
                        <div className="blog-entries row">
                            {blogEntries.reverse().map((blogEntry) => (
                                <article className={`${styles.blogEntryBox} col-12 col-lg-4`} key={blogEntry.id}>
                                    <Link href={`/blog/${blogEntry.slug}`} >
                                        <Image className={`${styles.blogEntryImage}`} src={`/img/blog/${blogEntry.image}`} title={`${blogEntry.title}`} width={200} height={200} />
                                    </Link>
                                    <div className={`${styles.blogEntryTextBox}`} >
                                        <Link href={`/blog/${blogEntry.slug}`} className="blog-title"><h2>{blogEntry.title}</h2></Link>
                                        <h3>{blogEntry.subline}</h3>
                                        <p>{blogEntry.teaser}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}