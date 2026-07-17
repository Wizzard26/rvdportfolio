import BlogClient from "@/components/blog/BlogClient";
import { pageMetadata } from "@/lib/seo";

// TODO add Hero and teaser section
// TODO add more blog entries
// TODO add pagination maximum entries on one site
// TODO add styling for blog page
// TODO set all relevated links, from main page and to single page
// TODO feature add filter by category and more

// `noindex`: Die Beiträge in `lib/blog.js` sind Platzhalter (u. a. Autor
// "Admin", Themen ohne Bezug zur Positionierung). Dünner Inhalt, der nicht zum
// Profil passt, schadet der Bewertung der gesamten Domain — deshalb bleibt der
// Blog aus dem Index, bis echte Beiträge stehen. Er ist außerdem nicht in der
// sitemap.xml gelistet.
//
// Bewusst NICHT über robots.txt gesperrt: Ein Crawler muss die Seite abrufen
// dürfen, um das noindex überhaupt zu lesen. `follow: true` lässt ihn den
// internen Links weiter folgen.
//
// Zum Aktivieren später: `noindex` hier und in `blog/[slug]/page.js` entfernen,
// beide Routen in `app/sitemap.js` ergänzen und den Nav-Eintrag in
// `lib/pages.js` wieder einblenden (`hideTop: false`).
export const metadata = pageMetadata({
    title: 'Blog',
    description: 'Neuigkeiten und Beiträge von René van Dinter.',
    path: '/blog',
    noindex: true,
});

export default function Blog() {
    return <BlogClient />
}
