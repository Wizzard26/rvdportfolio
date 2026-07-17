// Rendert ein JSON-LD-Script-Tag mit strukturierten Daten (schema.org).
//
// Server-Component ohne 'use client': Das Markup steht dadurch direkt im
// ausgelieferten HTML und ist auch für Crawler sichtbar, die kein JavaScript
// ausführen.
//
// `dangerouslySetInnerHTML` ist hier der von Next dokumentierte Weg — der
// Inhalt stammt ausschließlich aus eigenen Daten (`lib/seo.js`), nie aus
// Nutzereingaben.
export default function JsonLd({ data }) {
    const schemas = Array.isArray(data) ? data : [data];

    return (
        <>
            {schemas.map((schema, index) => (
                <script
                    key={schema['@id'] ?? `${schema['@type']}-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </>
    );
}
