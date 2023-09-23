import { blogEntries } from "@/lib/data";
import Image from "next/image";
import styles from "./styles.module.css";
import { roboto, ranga } from "@/app/fonts";

export default function Slug({ params }) {
    const { title,subline,image,  teaser} = blogEntries.find(entry => {
        return entry.slug === params.slug;
    })

    return(
        <>
            <main className="main-content">
                <section>
                    <div className="content-inner">
                        <div className="blog-single-entry row">
                            <div className={`${styles.blogImage} col-lg-4`}>
                                <Image src={`/img/blog/${image ? image : 'no-image.jpg'}`} title={`${title}`} width={200} height={200} alt={`${title}`}  />
                            </div>
                            <div className="blog-headlines col-lg-8">
                                <h1 className={roboto.className}>{ title }</h1>
                                <h2 className={ranga.className}>{ subline }</h2>
                                <p>{ teaser }</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}