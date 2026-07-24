import styles from "@/app/(portfolio)/blog/styles.module.css";
import Link from "next/link";

// Kategorien-Sidebar. `categories` kommt aus content.db (admin-verwaltet) und
// wird von der Blog-Seite durchgereicht.
export default function BlogCategories({categories = [], activeCategory}) {

    if (categories.length === 0) return null;

    return (
        <ul className={`${styles.blogSidebarUl}`}>
            {categories.map((cats) => (
                <li className={`${styles.blogSidebarUlLi}`} key={cats.id}>
                    <Link
                        className={`${styles.blogSidebarUlLiA} ${activeCategory === cats.name.toLowerCase() ? 'is--active': ''}`}
                        href={`/blog?cat=${cats.name}`}
                    >{cats.name}</Link>
                </li>
            ))}
        </ul>
    )
}
