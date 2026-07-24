// Reine Hilfsfunktionen für die Doku-Ansicht (keine DB, keine React).
// Aus den flachen content_posts-Zeilen (type='doc') baut sich hier der
// Sidebar-Baum, die flache Reihenfolge für Prev/Next und das Inhaltsverzeichnis.

// Muss identisch zur Anker-Bildung in components/blog/Markdown.js sein, damit
// die TOC-Links auf die richtigen Überschriften-IDs zeigen.
export function slugifyHeading(text) {
    return (text || '')
        .toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Überschriften (H2/H3) aus dem Markdown-Body ziehen — für das rechte
// Inhaltsverzeichnis. Codeblöcke (``` … ```) werden übersprungen, damit
// Kommentarzeilen darin nicht als Überschrift zählen.
export function extractHeadings(markdown) {
    const out = [];
    let inFence = false;
    for (const line of (markdown || '').split('\n')) {
        if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
        if (inFence) continue;
        const m = line.match(/^(#{2,3})\s+(.+?)\s*#*$/);
        if (m) out.push({ level: m[1].length, text: m[2].trim(), id: slugifyHeading(m[2].trim()) });
    }
    return out;
}

// Flache Doku-Liste (bereits nach sort_order sortiert) → gruppierter Baum:
// [{ group, items: [{ doc, children: [doc, …] }] }]. Kinder hängen über
// parent_id an ihrem Elternbeitrag; Top-Level-Beiträge landen unter ihrer
// doc_group (Reihenfolge = erstes Auftreten der Gruppe).
export function buildDocTree(docs) {
    const byId = new Map(docs.map((d) => [d.id, d]));
    const groups = [];
    const groupMap = new Map();

    for (const d of docs) {
        // Kinder werden unter ihrem Elternbeitrag ausgegeben, nicht separat.
        if (d.parent_id && byId.has(d.parent_id)) continue;
        const g = d.doc_group || '';
        if (!groupMap.has(g)) {
            const obj = { group: g, items: [] };
            groupMap.set(g, obj);
            groups.push(obj);
        }
        groupMap.get(g).items.push({
            doc: d,
            children: docs.filter((c) => c.parent_id === d.id),
        });
    }
    return groups;
}

// Baum → flache Liste in Anzeige-Reihenfolge (für Prev/Next-Navigation).
export function flattenDocs(tree) {
    const flat = [];
    for (const grp of tree) {
        for (const item of grp.items) {
            flat.push(item.doc);
            for (const child of item.children) flat.push(child);
        }
    }
    return flat;
}
