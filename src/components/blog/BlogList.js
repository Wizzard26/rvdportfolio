'use client';
import BlogArticle from "@/components/blog/BlogArticle";
import {getCategoryPost, getAllPost} from "@/blog/blogPost";
import {useEffect, useState} from "react";
import Pagination from "@/components/pagination/Pagination";
import {scrollToTop} from "@/utils/scrollTop";


export default function BlogList({
     cat= '',
     author =  false,
     tags = false,
     button = false,
     limit = 0,
     perPage = 0,
     pagination = false,
     articleCols = 'col-12'
}) {
    const [blogData, setBlogData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pages, setPages] = useState(1);
    const [activePage, setActivePage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = !cat ? getAllPost() : getCategoryPost({params: `${cat}`});
                setBlogData(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error by fetching data', error);
            }
        };

        fetchData();
    },[cat])

    const blogEntries = blogData?.length;

    useEffect(() => {
        if(perPage) setPages(Math.ceil(blogEntries / perPage));
        setActivePage(1)
    }, [blogData, pages]);

    const handlePageChange = (newPage) => {
        setActivePage(newPage);
        scrollToTop();
    };

    const startIndex = limit > 0 ? 0 : (activePage - 1 ) * perPage;
    const endIndex = limit > 0 ? limit : startIndex + perPage;
    let keyIndex = 1;



    if(isLoading) return <p>Loading...</p>

    return (
        <>
            <div className="blog-entries row">
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