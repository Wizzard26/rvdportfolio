'use client';
import BlogArticle from "@/components/blog/BlogArticle";
import {getCategoryPost, getAllPost} from "@/blog/blogPost";
import {useEffect, useState} from "react";


export default function BlogList({cat= '', author =  false, tags = false, button = false, limit = 0, pagination = false, page=''}) {
    const [blogData, setBlogData] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setBlogData(!cat ? getAllPost() : getCategoryPost({params: `${cat}`}));
        setIsLoading(false);

    },[cat])

    if(isLoading) return <p>Loading...</p>
    return (
        <div className="blog-entries row">
            {
                blogData.map((blogEntry) => (
                    <BlogArticle
                        key={blogEntry.id}
                        blogEntry={blogEntry}
                        author={author}
                        tags={tags}
                        button={button}
                        limit={limit}
                    />
                ))
            }
        </div>
    )
}