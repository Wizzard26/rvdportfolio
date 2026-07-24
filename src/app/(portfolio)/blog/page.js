import BlogClient from "@/components/blog/BlogClient";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata, blogSchema, breadcrumbSchema, ogImageUrl } from "@/lib/seo";
import { getPosts } from "@/lib/content/postsStore";
import { getCategories } from "@/lib/content/categoriesStore";

// Inhalte kommen aus content.db (admin-editierbar). `publicOnly` blendet
// Entwürfe aus — auf der öffentlichen Seite erscheinen nur aktive Beiträge.
export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
    title: 'Blog – Shopware, Webentwicklung & E-Commerce',
    description: 'Beiträge zu Shopware, Webentwicklung und E-Commerce von René van Dinter.',
    path: '/blog',
    image: ogImageUrl('Blog', 'René van Dinter'),
});

export default function Blog() {
    const posts = getPosts({ type: 'blog', publicOnly: true });
    const categories = getCategories({ publicOnly: true });
    return (
        <>
            <JsonLd data={[
                blogSchema(posts),
                breadcrumbSchema([{ name: 'Blog', path: '/blog' }]),
            ]} />
            <BlogClient posts={posts} categories={categories} />
        </>
    );
}
