'use client';

import { blogCategories } from "@/lib/blog";
import Link from "next/link";
import styles from "./styles.module.css";
import {ranga, roboto} from "@/app/fonts";
import {getCategoryPost, getAllPost} from "@/blog/blogPost";
import {useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import BlogArticle from "@/components/blog/BlogArticle";

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
    const activeCategory = cat ? cat.toLowerCase() : null;

    const [isCategory, setIsCategory] = useState(false);

    useEffect(() => {
        cat ? setIsCategory(true) : setIsCategory(false);
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
                            <div className={`${styles.blogSidebar} blog-sidebar col-12 col-lg-3 order-md-2 d-none d-lg-block`} >
                                <ul className={`${styles.blogSidebarUl}`}>
                                {blogCategories.map((cats) => (
                                    <li className={`${styles.blogSidebarUlLi}`} key={cats.id}>
                                        <Link
                                            className={`${styles.blogSidebarUlLiA} ${activeCategory === cats.name.toLowerCase() ? 'is--active': ''}`}
                                            href={`/blog?cat=${cats.name}`}
                                        >{cats.name}</Link>
                                    </li>
                                ))
                                }
                                </ul>
                            </div>
                            <div className="blog-main-entrys col-12 col-lg-9 order-md-1">
                                {isCategory &&
                                    <div className={styles.blogFilterActions}>
                                        <Link href={`/blog`} className={styles.blogResetFilter}>Alle Beiträge Anzeigen</Link>
                                    </div>
                                }
                                <div className="blog-entries row">
                                    {data.map((blogEntry) => (
                                        <BlogArticle
                                            key={blogEntry.id}
                                            blogEntry={blogEntry}
                                            author={true}
                                            tags={true}
                                            button={false}
                                            limit={0}
                                        />
                                    ))}
                                </div>
                                {isCategory &&
                                    <div className={styles.blogFilterActions}>
                                        <Link href={`/blog`} className={styles.blogResetFilter}>Alle Beiträge Anzeigen</Link>
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