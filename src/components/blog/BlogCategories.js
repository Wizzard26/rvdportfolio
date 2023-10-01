import { blogCategories } from "@/lib/blog";
import styles from "@/app/(portfolio)/blog/styles.module.css";
import Link from "next/link";

export default function BlogCategories({activeCategory}) {

    return (
        <ul className={`${styles.blogSidebarUl}`}>
            {blogCategories.map((cats) => (
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