import { getCategories } from '@/lib/content/categoriesStore';
import CategoryManager from '@/components/analytics/CategoryManager';
import PostsAdminTabs from '@/components/analytics/PostsAdminTabs';

export const dynamic = 'force-dynamic';

export default async function CategoriesAdmin() {
    const categories = getCategories();

    return (
        <div className="an-dashboard">
            <div className="an-head">
                <div>
                    <h1>Kategorien verwalten</h1>
                    <p>Blog-Kategorien anlegen, sortieren und löschen · {categories.length} Kategorien</p>
                </div>
            </div>

            <PostsAdminTabs active="categories" />

            <section className="an-card">
                <CategoryManager categories={categories} />
            </section>
        </div>
    );
}
