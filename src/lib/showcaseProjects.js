// Strukturierte Metadaten der Showcase-Projekte.
//
// Zweck (aktuell): Quelle für die strukturierten Daten (JSON-LD) auf /showcase,
// damit einzelne Projekte für Suchmaschinen und KI-Systeme als eigenständige
// Werke erkennbar werden — nicht nur die Sammelseite.
//
// Zugleich der erste Schritt Richtung datengetriebener Showcase: Wenn der
// Showcase-Bereich später dynamisch (DB + Admin) wird, ist dies die Vorlage
// für das Datenmodell.
//
// Inhalte sind 1:1 aus den bestehenden Showcase-Komponenten übernommen
// (ShowShopware.js / ShowReact.js) — nichts erfunden. `type`: WebApplication
// für eigenständige Web-Apps/Plattformen, SoftwareApplication für Shopware-
// Plugins/Erweiterungen. `image` nur, wo ein echtes Projektbild existiert
// (Platzhalter/Video ausgelassen).

export const showcaseProjects = [
    // ── Shopware ──────────────────────────────────────────────────────────
    {
        id: 'calculator-builder',
        name: 'Shopware 6 Calculator Builder',
        description: 'Eigenentwicklung eines Shopware-6-Plugins, mit dem sich interaktive Rechner-Widgets vollständig im Backend zusammenklicken lassen – ganz ohne Code.',
        category: 'shopware',
        type: 'SoftwareApplication',
        applicationCategory: 'BusinessApplication',
        tech: ['Shopware 6', 'PHP', 'Symfony', 'Vue.js', 'Twig', 'MySQL'],
        image: '/img/casestudy/shopware/calculator-builder.jpg',
    },
    {
        id: 'erlebniswelt-elemente',
        name: 'Shopware 6 Erlebniswelt Elemente',
        description: 'Maßgeschneiderte Erlebniswelten-Elemente auf Basis eines angepassten Grid-Systems, mit denen Redakteure Inhalte flexibel gestalten – ohne Zusatz-Plugins oder manuelles Styling.',
        category: 'shopware',
        type: 'SoftwareApplication',
        applicationCategory: 'BusinessApplication',
        tech: ['Shopware 6', 'Twig', 'Vue.js', 'SCSS'],
        image: '/img/casestudy/shopware/gridswapbox.jpg',
    },
    {
        id: 'slider-text-bild',
        name: 'Slider Element Text & Bild',
        description: 'Modifikation des Standard-Image-Carousels in Shopware 6 zur Darstellung erweiterter Inhalte (Bild, Text, Call-to-Action) direkt in den Erlebniswelten.',
        category: 'shopware',
        type: 'SoftwareApplication',
        applicationCategory: 'BusinessApplication',
        tech: ['Shopware 6', 'Twig', 'SCSS', 'JavaScript'],
        image: '/img/casestudy/shopware/textimageslider.jpg',
    },
    {
        id: 'video-text-banner',
        name: 'Shopware 6 Video-Text Banner',
        description: 'Individuell konfigurierbarer Video-Banner als Erlebniswelten-Element in Shopware 6 – komplett ohne externe Video-Provider oder Cookie-Abfragen (DSGVO-konform).',
        category: 'shopware',
        type: 'SoftwareApplication',
        applicationCategory: 'BusinessApplication',
        tech: ['Shopware 6', 'Twig', 'Vue.js', 'SCSS'],
        image: '/img/casestudy/shopware/videotextbanner.jpg',
    },
    {
        id: 'chatbot4you',
        name: 'Shopware 5 & 6 Chatbot',
        description: 'Shopware-Plugin zur nahtlosen Einbindung des Chat4You-Chatbots inklusive API-Anbindung und DSGVO-konformer Cookie-Verwaltung – für Shopware 5 und 6.',
        category: 'shopware',
        type: 'SoftwareApplication',
        applicationCategory: 'BusinessApplication',
        tech: ['Shopware 5 & 6', 'PHP', 'REST-API', 'JavaScript'],
        image: '/img/casestudy/shopware/chatbot4you.jpg',
    },
    {
        id: 'rezept-plugin',
        name: 'Shopware 5 Rezept Plugin',
        description: 'Individuelles Shopware-5-Plugin mit interaktiver Rezeptdatenbank für BARF-Tierhalter, inklusive Zutatenrechner nach Tiergewicht und Verlinkung zu den passenden Produkten.',
        category: 'shopware',
        type: 'SoftwareApplication',
        applicationCategory: 'BusinessApplication',
        tech: ['Shopware 5', 'PHP', 'Smarty', 'MySQL', 'JavaScript'],
        image: '/img/casestudy/shopware/Recipelist.jpg',
    },

    // ── React / Next.js ───────────────────────────────────────────────────
    {
        id: 'dartplaner',
        name: 'DartPlaner – Web- & App-Plattform',
        description: 'Umfangreiche, API-getriebene Fullstack-Plattform zur Verwaltung von Dart-Ligen, -Turnieren und -Vereinen mit mehreren eigenständigen Anwendungen (in Entwicklung).',
        category: 'react',
        type: 'WebApplication',
        applicationCategory: 'SportsApplication',
        tech: ['Symfony', 'API Platform', 'PostgreSQL', 'Mercure', 'Next.js', 'React', 'TypeScript', 'PWA'],
    },
    {
        id: 'dartsconnect',
        name: 'DartsConnect Netzwerk App',
        description: 'Social-Network-App, die Darts-Enthusiasten miteinander verbindet – entstanden im Zuge eines React/Next-Bootcamps.',
        category: 'react',
        type: 'WebApplication',
        applicationCategory: 'SocialNetworkingApplication',
        tech: ['Next.js', 'React', 'MongoDB', 'Mongoose', 'Auth'],
    },
    {
        id: 'calendly-clone',
        name: 'Calendly Meeting Clone',
        description: 'Calendly-ähnlicher Meeting-Planer mit Next.js – ohne Abo-Modell oder Einschränkungen, um Termine schnell und einfach zu planen.',
        category: 'react',
        type: 'WebApplication',
        applicationCategory: 'BusinessApplication',
        tech: ['Next.js', 'React', 'MongoDB', 'REST-API', 'Mail-API'],
    },
    {
        id: 'event-kalender',
        name: 'Event Kalender Planer',
        description: 'Kalender-Anwendung mit React und Next.js zur Verwaltung und Darstellung von Veranstaltungen in Monats-, Wochen-, Tages- und Jahresansicht.',
        category: 'react',
        type: 'WebApplication',
        applicationCategory: 'BusinessApplication',
        tech: ['Next.js', 'React', 'JSON'],
        image: '/img/casestudy/web/calendarapp.jpg',
    },
    {
        id: 'projekt-konfigurator',
        name: 'Multi-Step Web-Projekt Konfigurator',
        description: 'Interaktiver Multi-Step-Konfigurator, mit dem Interessenten ihr geplantes Webprojekt Schritt für Schritt strukturieren und erste Anforderungen definieren.',
        category: 'react',
        type: 'WebApplication',
        applicationCategory: 'BusinessApplication',
        tech: ['Next.js', 'React', 'Mail-API'],
    },
    {
        id: 'fullstack-plattform',
        name: 'Eigene Fullstack-Business-Plattform',
        description: 'Selbst entwickelte Business-Plattform als Next.js-Fullstack-Anwendung mit MongoDB – aus einem CMS gewachsen, produktiv im Einsatz hinter Gambit24.',
        category: 'react',
        type: 'WebApplication',
        applicationCategory: 'BusinessApplication',
        tech: ['Next.js', 'React', 'MongoDB', 'NextAuth', 'Recharts', 'REST-API'],
    },
];
