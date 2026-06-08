'use client';
import { use } from "react";
import { blogEntries } from "@/lib/blog";
import Image from "next/image";
import styles from "./styles.module.css";
import { roboto, ranga } from "@/app/fonts";
import { useRouter, notFound } from "next/navigation";

export default function Slug({ params }) {
    const router = useRouter();
    const { slug } = use(params);
    const entry = blogEntries.find((entry) => entry.slug === slug);
    if (!entry) notFound();
    const { title, subline, image, teaser } = entry;

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
                        <button className={`${styles.backBtn} btn btn--secondary-full`} type={'button'} onClick={router.back}>
                            Zurück zur Übersicht
                        </button>
                    </div>
                </section>
            </main>
        </>
    )
}