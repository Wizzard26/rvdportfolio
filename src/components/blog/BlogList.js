'use client';
import BlogArticle from "@/components/blog/BlogArticle";
import {useEffect, useMemo, useState} from "react";
import Pagination from "@/components/pagination/Pagination";
import {scrollToTop} from "@/utils/scrollTop";

// Filtert die (serverseitig geladenen) Beiträge nach Kategorie. Die Beiträge
// kommen aus content.db und werden von der Blog-Seite als `posts` durchgereicht.
function filterByCategory(posts, cat) {
    if (!cat) return posts;
    const needle = cat.toLowerCase();
    return posts.filter((p) =>
        (p.categoryList || []).some((c) => c.toLowerCase().includes(needle))
    );
}

export default function BlogList({
     posts = [],
     cat= '',
     author =  false,
     tags = false,
     button = false,
     limit = 0,
     perPage = 0,
     pagination = false,
     articleCols = 'col-12'
}) {
    const blogData = useMemo(() => filterByCategory(posts, cat), [posts, cat]);
    const [pages, setPages] = useState(1);
    const [activePage, setActivePage] = useState(1);

    const blogEntries = blogData?.length;

    useEffect(() => {
        if(perPage) setPages(Math.ceil(blogEntries / perPage));
        setActivePage(1)
    }, [blogData, perPage, blogEntries]);

    const handlePageChange = (newPage) => {
        setActivePage(newPage);
        scrollToTop();
    };

    const startIndex = limit > 0 ? 0 : (activePage - 1 ) * perPage;
    const endIndex = limit > 0 ? limit : startIndex + perPage;
    let keyIndex = 1;

    if (blogData.length === 0) return <p>Aktuell sind keine Beiträge vorhanden.</p>

    return (
        <>
            {/* Der `key` bindet das Grid an Filter + Seite: ändert sich einer,
                mountet die Liste komplett neu und alle Boxen laufen sauber der
                Reihe nach ein (statt dass nur neu hinzukommende Boxen gestaffelt
                animieren und die übrigen stehenbleiben → „durcheinander"). */}
            <div className="blog-entries row" key={`${cat || 'all'}-${activePage}`}>
                {
                    blogData.slice(startIndex, endIndex).map((blogEntry) => (
                        <BlogArticle
                            key={blogEntry.id}
                            blogEntry={blogEntry}
                            author={author}
                            tags={tags}
                            button={button}
                            articleCols={articleCols}
                            index={keyIndex++}
                        />
                    ))
                }
            </div>
            {pagination && pages > 1 && limit === 0 && (
                    <Pagination
                        currentPage={activePage}
                        totalPages={pages}
                        onPageChange={handlePageChange}
                    />
                )
            }
        </>
    )
}