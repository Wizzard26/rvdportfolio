'use client';

import Link from "next/link";
import styles from "@/app/(portfolio)/blog/styles.module.css";
import { roboto } from "@/app/fonts";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import BlogList from "@/components/blog/BlogList";
import BlogCategories from "@/components/blog/BlogCategories";

// Interaktiver Teil der Blog-Übersicht (Kategorie-Filter über ?cat=).
//
// Ausgelagert aus `blog/page.js`, damit die Seite eine Server-Component bleibt
// und `metadata` exportieren kann — hier konkret das `noindex`, solange der
// Blog nur Platzhalter-Beiträge enthält.

function BlogContent() {
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
                                    perPage={6}
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

export default function BlogClient() {
    return (
        <Suspense fallback={<main className="main-content"><section><div className="content-inner">Beiträge werden geladen …</div></section></main>}>
            <BlogContent />
        </Suspense>
    )
}
