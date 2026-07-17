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
        hasOccupation: {
            '@type': 'Occupation',
            name: 'Shopware- & Web-Developer',
            occupationalCategory: '15-1254.00', // O*NET: Web Developers
            skills: knowsAbout.join(', '),
        },
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
