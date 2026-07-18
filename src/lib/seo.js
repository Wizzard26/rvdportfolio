// Zentrale SEO-Konfiguration.
//
// Alles, was Suchmaschinen und KI-Systeme über diese Seite wissen sollen, wird
// hier gepflegt — Metadaten, OpenGraph, Canonicals und die strukturierten Daten
// (JSON-LD). Einzelne Seiten bauen ihre Metadaten über `pageMetadata()`.
//
// WICHTIG: Die Angaben im Person-Schema sind maschinenlesbare Fakten über René.
// Sie müssen mit `vita.js`, `skillset.js` und dem Impressum übereinstimmen —
// hier nichts erfinden oder ausschmücken.

export const siteConfig = {
    // Kanonische Domain: OHNE www. `www.` leitet per next.config.js hierher um.
    url: 'https://rene-van-dinter.de',
    name: 'René van Dinter',
    title: 'René van Dinter – Shopware- & Web-Developer',
    // Meta-Description: ~150–160 Zeichen. Google schneidet längere Snippets
    // im Suchergebnis ab — der abgeschnittene Teil ist verschenkter Platz.
    description:
        'Shopware-6- & Web-Developer aus Stade: Plugins, Apps und Storefront-Themes, dazu Frontends mit React und Next.js – als Entwickler mit Designhintergrund.',
    // Für die strukturierten Daten. Hier gibt es keine Längenbegrenzung, und
    // je mehr Kontext ein LLM bekommt, desto besser kann es René einordnen.
    descriptionLong:
        'René van Dinter ist Shopware-6- & Web-Developer aus Stade mit über 15 Jahren Erfahrung aus Agentur und E-Commerce. Schwerpunkte: Shopware-6-Plugins, -Apps und -Storefront-Themes sowie Frontends und Web-Apps mit JavaScript, React und Next.js, dazu PHP/Symfony, REST-APIs, Git und Docker. Als gelernter Mediengestalter Digital und Print denkt er Design und UX von Anfang an mit.',
    locale: 'de_DE',
    lang: 'de',
};

// Social-Profile — Quelle: Footer. Speisen `sameAs` im Person-Schema und sind
// für Google/LLMs der Beleg, dass Portfolio und Profile dieselbe Person sind.
export const socialProfiles = [
    'https://github.com/Wizzard26',
    'https://www.linkedin.com/in/rene-van-dinter-6a5a2b14a/',
    'https://www.xing.com/profile/Rene_vanDinter/cv',
];

// Fachgebiete — Quelle: skillset.js + Aufgabengebiete der Startseite.
export const knowsAbout = [
    'Shopware 6',
    'Shopware-Plugin-Entwicklung',
    'Shopware-Theme-Entwicklung',
    'E-Commerce',
    'PHP',
    'Symfony',
    'Twig',
    'JavaScript',
    'React',
    'Next.js',
    'Node.js',
    'HTML',
    'CSS',
    'SASS',
    'REST-APIs',
    'MySQL',
    'Git',
    'Docker',
    'Frontend-Entwicklung',
    'Webentwicklung',
    'Mediengestaltung Digital und Print',
    'UI/UX-Design',
];

// Zertifizierungen & Abschlüsse — Quelle: vita.js (vitaPersonal, Bereich
// "Qualifikationen"). Nur Belegtes.
const credentials = [
    { name: 'Mediengestalter Digital und Print (IHK)', issuer: 'IHK' },
    { name: 'Shopware 5 Certified Template Developer', issuer: 'shopware AG' },
    { name: 'Shopware 6 Certified Template Designer', issuer: 'shopware AG' },
    { name: 'JavaScript Developer', issuer: 'alfatraining Bildungszentrum GmbH' },
    { name: 'Certified PHP Developer', issuer: 'alfatraining Bildungszentrum GmbH' },
    { name: 'Web-Developer React.js / Next.js', issuer: 'neue fische' },
];

// Ausbildungsstationen — Quelle: vita.js.
const education = [
    { name: 'IBB-Buxtehude', type: 'EducationalOrganization' },
    { name: 'alfatraining Bildungszentrum GmbH', type: 'EducationalOrganization' },
    { name: 'neue fische', type: 'EducationalOrganization' },
];

// Das von `app/opengraph-image.js` erzeugte Vorschaubild.
//
// Muss hier explizit stehen: Sobald eine Seite einen eigenen `openGraph`-Block
// definiert, ersetzt Next damit die Datei-Konvention, statt sie zu ergänzen —
// das Bild fiele dann ersatzlos weg (verifiziert: Seiten ohne eigenen
// openGraph-Block bekamen es automatisch, Seiten mit Block nicht).
// Der relative Pfad wird über `metadataBase` im Root-Layout absolut gemacht.
const ogImage = {
    url: '/opengraph-image',
    width: 1200,
    height: 630,
    alt: `${siteConfig.title} – Portfolio`,
    type: 'image/png',
};

/**
 * Baut die Metadaten einer Seite.
 *
 * `path` ist der Pfad ab Domain-Root ('/vita'); daraus entsteht der Canonical.
 * Ohne Canonical würde jede Variante einer URL (Parameter, www) als eigene
 * Seite zählen.
 */
export function pageMetadata({ title, description, path, noindex = false }) {
    const url = path === '/' ? siteConfig.url : `${siteConfig.url}${path}`;

    return {
        title,
        description,
        alternates: {
            canonical: path,
        },
        openGraph: {
            type: 'website',
            locale: siteConfig.locale,
            url,
            siteName: siteConfig.title,
            title,
            description,
            images: [ogImage],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
        ...(noindex && {
            robots: {
                index: false,
                follow: true,
                googleBot: { index: false, follow: true },
            },
        }),
    };
}

/**
 * Person-Schema — das Herzstück für Google Knowledge Graph und LLMs.
 *
 * Beantwortet maschinenlesbar „Wer ist René van Dinter, was kann er, wo ist er
 * zu finden“ — genau die Frage, die eine KI beantworten können muss, um ihn zu
 * empfehlen.
 */
export function personSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `${siteConfig.url}/#person`,
        name: 'René van Dinter',
        givenName: 'René',
        familyName: 'van Dinter',
        url: siteConfig.url,
        image: `${siteConfig.url}/img/about_me.png`,
        jobTitle: 'Shopware- & Web-Developer',
        description: siteConfig.descriptionLong,
        email: 'mailto:info@rene-van-dinter.de',
        telephone: '+49-174-9327538',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Schiffertorsstrasse 22',
            postalCode: '21682',
            addressLocality: 'Stade',
            addressRegion: 'Niedersachsen',
            addressCountry: 'DE',
        },
        nationality: { '@type': 'Country', name: 'Deutschland' },
        knowsLanguage: [
            { '@type': 'Language', name: 'Deutsch', alternateName: 'de' },
            { '@type': 'Language', name: 'Englisch', alternateName: 'en' },
        ],
        knowsAbout,
        sameAs: socialProfiles,
        alumniOf: education.map((item) => ({
            '@type': item.type,
            name: item.name,
        })),
        hasCredential: credentials.map((item) => ({
            '@type': 'EducationalOccupationalCredential',
            name: item.name,
            credentialCategory: 'certificate',
            recognizedBy: { '@type': 'Organization', name: item.issuer },
        })),
        // Mehrere Berufsrollen (statt einer) — bildet Renés Profil differenzierter
        // ab. O*NET-Codes: 15-1254.00 Web Developers, 27-1024.00 Graphic Designers.
        hasOccupation: [
            {
                '@type': 'Occupation',
                name: 'Shopware-Entwickler',
                occupationalCategory: '15-1254.00',
                skills: 'Shopware 6, Plugin-Entwicklung, Storefront-Themes, PHP, Symfony, Twig',
            },
            {
                '@type': 'Occupation',
                name: 'Web-Developer (React & Next.js)',
                occupationalCategory: '15-1254.00',
                skills: 'JavaScript, React, Next.js, Node.js, REST-APIs, HTML, CSS',
            },
            {
                '@type': 'Occupation',
                name: 'Mediengestalter Digital und Print',
                occupationalCategory: '27-1024.00',
                skills: 'UI/UX-Design, Grafikdesign, Printdesign, Adobe Creative Cloud',
            },
        ],
        // Aktuelle freiberufliche Tätigkeit (Quelle: vita.js, laufende Station).
        worksFor: {
            '@type': 'Organization',
            name: 'Gambit24 Media Solution',
        },
    };
}

/**
 * Werdegang-Schema für /vita — eine ItemList der beruflichen Stationen.
 * Gibt Suchmaschinen und LLMs die vollständige, geordnete Laufbahn maschinen-
 * lesbar an die Hand. `stations` kommt bereits neueste-zuerst aus der DB
 * (getStations()); `is_current` markiert die laufende Station.
 */
export function careerSchema(stations) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${siteConfig.url}/vita/#werdegang`,
        name: 'Beruflicher Werdegang von René van Dinter',
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: stations.length,
        itemListElement: stations.map((s, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: `${s.title} – ${s.company} (${s.start} – ${s.is_current ? 'heute' : s.end})`,
        })),
    };
}

/**
 * Showcase-Schema für /showcase — eine ItemList der Projekte, jedes als
 * eigenständiges Werk (SoftwareApplication / WebApplication) mit Bezug zur
 * Person. Damit können einzelne Projekte in Suche und KI-Antworten auftauchen,
 * nicht nur die Sammelseite. Quelle: showcaseProjects.js.
 */
export function showcaseSchema(projects) {
    // Nur Projekte mit gepflegtem schema_type als eigenständiges Werk auszeichnen.
    const items = projects.filter((p) => p.schema_type);
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${siteConfig.url}/showcase/#projekte`,
        name: 'Projekte & Referenzen von René van Dinter',
        numberOfItems: items.length,
        itemListElement: items.map((p, index) => {
            const description = p.headline || (p.introList && p.introList[0]) || '';
            const tech = (p.techList || []).join(', ');
            const isLocalImage = p.media_type === 'image' && p.media && p.media.startsWith('/');
            return {
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': p.schema_type,
                    name: p.name,
                    ...(description && { description }),
                    ...(p.application_category && { applicationCategory: p.application_category }),
                    ...(tech && { keywords: tech }),
                    inLanguage: siteConfig.lang,
                    author: { '@id': `${siteConfig.url}/#person` },
                    creator: { '@id': `${siteConfig.url}/#person` },
                    ...(isLocalImage && { image: `${siteConfig.url}${p.media}` }),
                },
            };
        }),
    };
}

/**
 * WebSite-Schema — verknüpft die Domain mit der Person und macht die Seite als
 * zusammenhängendes Werk erkennbar.
 */
export function webSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.title,
        description: siteConfig.descriptionLong,
        inLanguage: siteConfig.lang,
        publisher: { '@id': `${siteConfig.url}/#person` },
        author: { '@id': `${siteConfig.url}/#person` },
        copyrightHolder: { '@id': `${siteConfig.url}/#person` },
    };
}

/**
 * Breadcrumb-Schema. Google zeigt daraus den Pfad statt der nackten URL im
 * Suchergebnis an.
 *
 * `trail` z. B. [{ name: 'Vita', path: '/vita' }] — „Start“ wird vorangestellt.
 */
export function breadcrumbSchema(trail) {
    const items = [{ name: 'Start', path: '/' }, ...trail];

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.path === '/' ? siteConfig.url : `${siteConfig.url}${item.path}`,
        })),
    };
}
