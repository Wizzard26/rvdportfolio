'use client';

import Link from "next/link";
import styles from "./styles.module.css";
import {ranga, roboto} from "@/app/fonts";
import {useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import BlogList from "@/components/blog/BlogList";
import BlogCategories from "@/components/blog/BlogCategories";

// TODO add Hero and teaser section
// TODO add more blog entries
// TODO add Blog routing for single page entries
// TODO add pagination maximum entries on one site
// TODO add styling for blog page
// TODO set all relevated links, from main page and to single page

// TODO feature add filter by category and more



export default function Blog() {
    const searchParams = useSearchParams();
    const cat = searchParams.get('cat');

    const [isCategory, setIsCategory] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        cat ? setIsCategory(true) : setIsCategory(false);
        setActiveCategory(cat ? cat.toLowerCase() : null);
    },[cat])

    return(
        <>
            <main className="main-content">
                <section>
                    <div className="content-inner">
                        <h1 className={roboto.className}>Neuigkeiten und Allgemeine Blog Themen</h1>
                        <div className="blog-main row">
                            <div className={`${styles.blogSidebar} blog-sidebar col-12 col-lg-3 order-md-2 d-none d-lg-block`} >
                                <BlogCategories
                                    activeCategory={activeCategory}
                                />
                            </div>
                            <div className="blog-main-entrys col-12 col-lg-9 order-md-1">
                                {isCategory &&
                                    <div className={styles.blogFilterActions}>
                                        <Link href={`/blog`} className={styles.blogResetFilter}>Alle Beiträge Anzeigen</Link>
                                    </div>
                                }
                                <BlogList
                                    cat={cat}
                                    author={true}
                                    tags={true}
                                    button={false}
                                    limit={0}
                                    perPage={3}
                                    pagination={true}
                                    articleCols={'col-12 col-md-6 col-xl-4'}
                                />
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