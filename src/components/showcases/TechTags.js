import styles from "./styles.module.css";

// Scannbare Tech-Tag-Leiste pro Showcase-Projekt.
export default function TechTags({ tags = [] }) {
    if (!tags.length) return null;
    return (
        <ul className={styles.techTags} aria-label="Eingesetzte Technologien">
            {tags.map((tag) => (
                <li key={tag}>{tag}</li>
            ))}
        </ul>
    );
}
