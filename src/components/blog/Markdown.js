import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import Link from 'next/link';
import styles from './markdown.module.css';

// Zentraler Markdown-Renderer für Blog- und Doku-Bodies.
//
// Server-Component: läuft komplett beim Rendern auf dem Server, kein Client-JS.
// Reihenfolge der rehype-Plugins ist wichtig — zuerst sanitisieren (XSS-Schutz),
// dann highlighten, damit die vom Highlighter erzeugten <span class="hljs-…">
// nicht wieder weggeputzt werden.
//
// Zusätzlich: ein Media-Layout über Directives (remark-directive):
//   :::media-left      Bild links, Text rechts
//   ![Alt](/img/…)
//   Text neben dem Bild …
//   :::
//   :::media-right     Bild rechts, Text links
// Stapelt auf schmalen Screens automatisch untereinander.

// Wandelt :::media-left/right in ein zweispaltiges div-Layout: das Bild landet
// in .media-figure, der restliche Text in .media-body.
function remarkMedia() {
    return (tree) => {
        visit(tree, (node) => {
            if (node.type !== 'containerDirective') return;
            if (node.name !== 'media-left' && node.name !== 'media-right') return;

            const right = node.name === 'media-right';
            const imageChildren = [];
            const textChildren = [];
            for (const child of node.children) {
                const hasImage = child.type === 'paragraph'
                    && Array.isArray(child.children)
                    && child.children.some((c) => c.type === 'image');
                (hasImage ? imageChildren : textChildren).push(child);
            }

            node.data = {
                ...(node.data || {}),
                hName: 'div',
                hProperties: { className: ['media', right ? 'media-right' : 'media-left'] },
            };
            node.children = [
                { type: 'mediaGroup', children: imageChildren, data: { hName: 'div', hProperties: { className: ['media-figure'] } } },
                { type: 'mediaGroup', children: textChildren, data: { hName: 'div', hProperties: { className: ['media-body'] } } },
            ];
        });
    };
}

// Anker-IDs aus dem Text einer Überschrift (für TOC/Deep-Links in der Doku).
function slugifyHeading(children) {
    const text = Array.isArray(children) ? children.join('') : String(children ?? '');
    return text
        .toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function Heading({ level, children }) {
    const Tag = `h${level}`;
    const id = slugifyHeading(children);
    return <Tag id={id} className={styles.heading}>{children}</Tag>;
}

// Sanitize-Schema erweitern: className auf code/span (Syntaxfärbung) und auf div
// (die Media-Layout-Klassen), sonst würden diese beim Bereinigen entfernt.
const schema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        code: [...(defaultSchema.attributes?.code || []), 'className'],
        span: [...(defaultSchema.attributes?.span || []), 'className'],
        div: [...(defaultSchema.attributes?.div || []), 'className'],
    },
};

// Ordnet die vom Media-Plugin gesetzten (globalen) Klassennamen den gehashten
// CSS-Modul-Klassen zu.
function mediaDiv({ className = '', children }) {
    const c = String(className).split(' ');
    if (c.includes('media')) {
        return <div className={`${styles.media} ${c.includes('media-right') ? styles.mediaRight : ''}`}>{children}</div>;
    }
    if (c.includes('media-figure')) return <div className={styles.mediaFigure}>{children}</div>;
    if (c.includes('media-body')) return <div className={styles.mediaBody}>{children}</div>;
    return <div className={className}>{children}</div>;
}

const components = {
    h1: (p) => <Heading level={1} {...p} />,
    h2: (p) => <Heading level={2} {...p} />,
    h3: (p) => <Heading level={3} {...p} />,
    h4: (p) => <Heading level={4} {...p} />,
    a: ({ href = '', children }) => {
        const internal = href.startsWith('/') || href.startsWith('#');
        if (internal) return <Link href={href}>{children}</Link>;
        return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    },
    // Frei im Text platzierte Bilder haben unbekannte Maße — natives <img> mit
    // height:auto behält das echte Seitenverhältnis (kein Verzerren wie bei einem
    // erzwungenen next/image-Format). Lazy-Loading für die Performance.
    img: ({ src = '', alt = '' }) => (
        <span className={styles.imgWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} loading="lazy" className={styles.img} />
        </span>
    ),
    div: mediaDiv,
    table: ({ children }) => (
        <div className={styles.tableWrap}><table>{children}</table></div>
    ),
};

export default function Markdown({ children, className = '' }) {
    if (!children) return null;
    return (
        <div className={`${styles.prose} ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkDirective, remarkMedia]}
                rehypePlugins={[[rehypeSanitize, schema], rehypeHighlight]}
                components={components}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
