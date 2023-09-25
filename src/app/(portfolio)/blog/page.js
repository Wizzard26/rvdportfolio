'use client';

import { blogCategories } from "@/lib/blog";
import Link from "next/link";
import styles from "./styles.module.css";
import Image from "next/image";
import {ranga, roboto} from "@/app/fonts";
import {getCategoryPost, getAllPost} from "@/blog/blogPost";
import {useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";

// TODO add Hero and teaser section
// TODO add more blog entries
// TODO add Blog routing for single page entries
// TODO add pagination maximum entries on one site
// TODO add styling for blog page
// TODO set all relevated links, from main page and to single page

// TODO feature add sidebar and categorylist
// TODO feature add filter by category and more
// TODO add author or / and date for entry

/*
export function getBlogPost()  {
    const blogPost = blogEntries;
    const entries = [...blogPost].reverse();
    return entries;
}
*/


export default function Blog() {
    const searchParams = useSearchParams();
    const cat = searchParams.get('cat');
    const page = searchParams.get('page');
    const data = !cat ? getAllPost() : getCategoryPost({params: `${cat}`});

    const [isFiltered, setIsFiltered] = useState(false);

    useEffect(() => {
        cat ? setIsFiltered(true) : setIsFiltered(false);
    },[cat])

    //const category = cat.charAt(0).toUpperCase() + cat.slice(1)
    //const data = getBlogPost();
    //const data = getAllPost();
    //const data = getCategoryPost({params: `${category}`});

    return(
        <>
            <main className="main-content">
                <section>
                    <div className="content-inner">
                        <h1 className={roboto.className}>Neuigkeiten und Allgemeine Blog Themen</h1>
                        <div className="blog-main row">
                            <div className="blog-sidebar col-12 col-md-6 col-lg-3">
                                <ul>
                                {blogCategories.map((cats) => (
                                    <li key={cats.id}><Link href={`/blog?cat=${cats.name}`}>{cats.name}</Link></li>
                                ))
                                }
                                </ul>
                            </div>
                            <div className="blog-main-entrys col-12 col-md-6 col-lg-9">
                                {isFiltered &&
                                    <div className={styles.blogFilterActions}>
                                        <Link href={`/blog`} className={styles.blogResetFilter}>Reset Filter</Link>
                                    </div>
                                }
                                <div className="blog-entries row">
                                    {data.map((blogEntry) => (
                                        <article className={`${styles.blogEntryBox} col-12 col-lg-4`} key={blogEntry.id}>
                                            <Link href={`/blog/${blogEntry.slug}`} >
                                                <Image className={`${styles.blogEntryImage}`} src={`/img/blog/${blogEntry.image ? blogEntry.image : 'no-image.jpg'}`} title={`${blogEntry.title}`} width={200} height={200} alt={`${blogEntry.title}`} />
                                            </Link>
                                            <div className="author">Written by: {blogEntry.author}</div>
                                            <div className={styles.blogTagList}>
                                                {blogEntry.category.map((blogTag, index) => (
                                                    <span className={styles.blogTag} key={index}><Link href={`/blog/?cat=${blogTag}`}>{blogTag}</Link></span>
                                                ))}
                                            </div>
                                            <div className={`${styles.blogEntryTextBox}`} >
                                                <Link href={`/blog/${blogEntry.slug}`} className="blog-title"><h2 className={roboto.className}>{blogEntry.title}</h2></Link>
                                                <h3 className={ranga.className}>{blogEntry.subline}</h3>
                                                <p>{blogEntry.teaser}</p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                                {isFiltered &&
                                    <div className={styles.blogFilterActions}>
                                        <Link href={`/blog`} className={styles.blogResetFilter}>Reset Filter</Link>
                                    </div>
                                }
                            </div>
                        </div>

                    </div>
                </section>
            </main>
        </>
    )
}