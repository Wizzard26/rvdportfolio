import { blogEntries } from "@/lib/blog";

function getBlogPost()  {
    const blogPost = blogEntries;
    const entries = [...blogPost].reverse();
    return entries;
}
export const getAllPost = () => {
    const data = getBlogPost();
    return data;
}

export const getCategoryPost = ({params}) => {
    //console.log('TestParams', params);
    //return data.filter( (data) => data.category.toLowerCase().includes(params) );

    const cat = params.toLowerCase();
    const data = getBlogPost();
    return data.filter( (item) => {
        return item.category.some((category) =>
            category.toLowerCase().includes(cat)
        );
    });
}