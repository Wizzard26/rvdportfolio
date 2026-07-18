// Showcase-Projekte (Case Studies) — Seed-Quelle für die dynamische Verwaltung.
//
// Diese Datei befüllt beim ersten Start die Tabelle showcase_projects in der
// content.db (siehe vitaStore-Muster). Danach ist die DB die Quelle der Wahrheit;
// Änderungen laufen über den Admin (/dashboard/showcase), nicht mehr hier.
//
// Inhalte 1:1 aus den bisherigen Komponenten (ShowShopware.js / ShowReact.js)
// übernommen. `media_type`: image | video | component (Whitelist: CallEvent,
// WebPage) | none. `variant`: full (große Sektion) | compact (Grid-Karte).
// `intro`/`features`/`tech` sind Arrays; im Store zu Textfeldern zusammengeführt.

export const showcaseProjects = [
    {
        "category": "shopware",
        "variant": "full",
        "name": "Shopware 6 Calculator Builder",
        "headline": "Interaktive Rechner-Widgets als Baukasten – vom Rechner bis zum Angebot",
        "intro": [
            "Eigenentwicklung eines Shopware-6-Plugins, mit dem sich interaktive Rechner-Widgets vollständig im Backend zusammenklicken lassen – ganz ohne Code. Ob Futtermengen-, Solar-Rentabilitäts- oder Fenstertausch-Angebotsrechner: Jeder Rechner entsteht in einem visuellen Builder mit Live-Vorschau für Desktop, Tablet und Mobile.",
            "Ziel war es, Shopbetreiber:innen unabhängig von Entwickler:innen zu machen. Statt für jeden Anwendungsfall ein eigenes Plugin zu bauen, konfigurieren Redakteur:innen Eingabefelder, Formeln und Ergebnis-Darstellung selbst und binden den fertigen Rechner per Erlebniswelten-Element an beliebiger Stelle im Shop ein.",
            "So wird aus einem reinen Produktshop ein Beratungswerkzeug: Rechner beantworten echte Kundenfragen, berechnen live Mengen, Kosten oder Wirtschaftlichkeit und führen direkt in den Warenkorb – oder bei erklärungsbedürftigen Leistungen in eine qualifizierte Angebotsanfrage. Erfasste Leads landen in einem eigenen Angebots-Workflow mit DSGVO-konformer Speicherung."
        ],
        "features": [
            "Visueller Builder mit Live-Vorschau und 18 Feldtypen – von Zahl, Dropdown und Slider bis Measurement, Image-Choice, Range-Slider und Datum/Zeit",
            "Formel-Engine mit validiertem Editor, Funktionen wie round, min/max, if/then, sqrt sowie Datums- und Lookup-Funktionen – inklusive integriertem Test-Panel",
            "Ergebnis-Baukasten aus Überschriften, Einzelwerten, Vergleichstabellen, Diagrammen und Disclaimern – frei kombinierbar",
            "Drei Rechnertypen: allgemein, produktgebunden (liest Daten des Produkts) und Buy-Box, bei der das Rechenergebnis zur Bestellmenge wird",
            "Live-Berechnung mit Debounce, optionaler Wizard-Modus, PDF-Export, Produktempfehlungen und Mehrfach-Add-to-Cart",
            "Lead-Erfassung mit frei konfigurierbaren Kontaktfeldern und Angebots-Workflow – Status, Rabatt, kundengebundener Gutscheincode bis hin zur erzeugten Bestellung",
            "DSGVO-Optionen (Consent, Aufbewahrungsdauer, CSV-Export) und serverseitig gecachte Live-Parameter, z.B. für tagesaktuelle Wechselkurse"
        ],
        "tech": [
            "Shopware 6",
            "PHP",
            "Symfony",
            "Vue.js",
            "Twig",
            "MySQL"
        ],
        "media_type": "image",
        "media": "/img/casestudy/shopware/calculator-builder.jpg",
        "schema_type": "SoftwareApplication",
        "application_category": "BusinessApplication"
    },
    {
        "category": "shopware",
        "variant": "full",
        "name": "Shopware 6 Erlebniswelt Elemente",
        "headline": "Erlebniswelt-Elemente für flexible Content-Inszenierung",
        "intro": [
            "Für ein Shopware-Projekt entwickelte ich maßgeschneiderte Erlebniswelten-Elemente, die den Redakteuren ermöglichen, Inhalte flexibel und visuell ansprechend zu gestalten – ohne zusätzliche Plugins oder manuelles Styling. Die Elemente basieren auf einem angepassten Grid-System, sind responsive aufgebaut und lassen sich vielseitig kombinieren.",
            "Oft stoßen Redakteure schnell an gestalterische Grenzen – insbesondere, wenn Inhalte visuell unterschiedlich präsentiert werden sollen, aber auf ein konsistentes Design Rücksicht genommen werden muss. Die Herausforderung bestand darin, mehrere Layout-Varianten zu entwickeln, die eigenständig funktionieren, sich aber dennoch nahtlos in das Gesamtbild einfügen.",
            "Jedes Element basiert auf einem flexiblen Grid-Fundament und wurde gezielt für die Redaktionsarbeit optimiert. Die Bedienung in Shopware bleibt intuitiv – Inhalte können einfach per Drag & Drop gepflegt werden."
        ],
        "features": [],
        "tech": [
            "Shopware 6",
            "Twig",
            "Vue.js",
            "SCSS"
        ],
        "media_type": "image",
        "media": "/img/casestudy/shopware/gridswapbox.jpg",
        "schema_type": "SoftwareApplication",
        "application_category": "BusinessApplication"
    },
    {
        "category": "shopware",
        "variant": "full",
        "name": "Slider Element Text & Bild",
        "headline": "Mehr als nur Bilder – Erweiterung des Shopware-Carousels",
        "intro": [
            "Modifikation des Standard-Image-Carousels in Shopware 6 zur Darstellung erweiterter Inhalte direkt in den Erlebniswelten.",
            "Verbesserung der gestalterischen und inhaltlichen Flexibilität für redaktionelle oder werbliche Inhalte, ohne auf externe Plugins zurückgreifen zu müssen.",
            "Mit dieser Erweiterung erhalten Redakteure und Shopbetreiber ein mächtiges Werkzeug zur Präsentation von Content-Highlights – z.B. für Kampagnen, News oder Produkteinführungen. Die Kombination aus Bild, Text und Button schafft eine hohe visuelle Präsenz und verbessert zugleich die Conversion-Möglichkeiten durch klare Call-to-Actions."
        ],
        "features": [
            "Layout-Anpassung: Bild links, Textbereich rechts – für eine klarere, modernere Inhaltsstruktur",
            "Zusätzliche Inhaltsfelder: Möglichkeit zur Pflege von Überschrift, Beschreibungstext und Call-to-Action-Button pro Slide",
            "Slide-Indikator: Implementierung einer fortlaufenden Slide-Navigation inklusive aktueller Position",
            "Backend-Integration: Erweiterung der Erlebniswelt-Komponente, vollständig konfigurierbar",
            "Frontend-Optimierung: Responsives Verhalten, sauberes Grid-basierendes Layout, optimiert für verschiedene Viewports"
        ],
        "tech": [
            "Shopware 6",
            "Twig",
            "SCSS",
            "JavaScript"
        ],
        "media_type": "image",
        "media": "/img/casestudy/shopware/textimageslider.jpg",
        "schema_type": "SoftwareApplication",
        "application_category": "BusinessApplication"
    },
    {
        "category": "shopware",
        "variant": "full",
        "name": "Shopware 6 Video-Text Banner",
        "headline": "Interaktiver Video-Banner mit Text",
        "intro": [
            "Eigenentwicklung eines individuell konfigurierbaren Video-Banners als Erlebniswelten-Element in Shopware 6 – komplett ohne externe Video-Provider oder Cookie-Abfragen.",
            "Bereitstellung eines aufmerksamkeitsstarken Banners mit nativer Video-Einbindung, das DSGVO-konform ohne Drittanbieter (z.B. YouTube) auskommt und gleichzeitig redaktionell flexibel bleibt.",
            "Das Video-Banner bietet eine starke visuelle Ansprache und eignet sich ideal für Markenkommunikation, Kampagnen oder emotionale Themen. Dank der einfachen Konfiguration im Backend lässt sich das Element auch ohne technisches Wissen an die CI des Shops anpassen."
        ],
        "features": [
            "Direkte Video-Auswahl: Integration von Videos aus der Shopware-Medienverwaltung – kein externer Dienst notwendig",
            "Text-Overlay mit Gestaltungsmöglichkeiten: Konfigurierbare Überschrift, Beschreibungstext und Call-to-Action-Button",
            "Individuelles Styling: Freie Farbwahl für Text, Button und Hintergrundüberlagerung direkt im Erlebniswelten-Editor",
            "Optimiert für UX & Performance: Autoplay ohne Ton, mobil optimiert, und fallbackfähig für verschiedene Browser"
        ],
        "tech": [
            "Shopware 6",
            "Twig",
            "Vue.js",
            "SCSS"
        ],
        "media_type": "image",
        "media": "/img/casestudy/shopware/videotextbanner.jpg",
        "schema_type": "SoftwareApplication",
        "application_category": "BusinessApplication"
    },
    {
        "category": "shopware",
        "variant": "full",
        "name": "Shopware 5 & 6 Chatbot",
        "headline": "Chatbot4You Integration für Shopware 5 & 6",
        "intro": [
            "Entwicklung eines Shopware-Plugins zur nahtlosen Einbindung des Chat4You-Chatbots inklusive API-Anbindung und Cookie-Verwaltung.",
            "Dieses Plugin erweitert Shopware 5 und 6 um eine voll integrierte Live-Chat- und Chatbot-Lösung über den Anbieter Chat4You. Es ermöglicht Shopbetreibern eine direkte Kommunikation mit ihren Kunden – entweder über den Kundenservice oder automatisiert über vordefinierte Bot-Antworten.",
            "Durch die Integration wird der Kundenservice deutlich entlastet und gleichzeitig verbessert – Kunden erhalten schnell Antworten auf ihre Fragen, während der Support gezielt dort eingreifen kann, wo es nötig ist. Die Lösung ist datenschutzkonform, effizient und einfach zu administrieren."
        ],
        "features": [
            "Nahtlose Einbindung: Integration des Chat4You-Dienstes über API",
            "Cookie-Handling inklusive: DSGVO-konforme Einbindung mit entsprechender Cookie-Verwaltung",
            "Automatisierte Antworten: Der Bot kann häufig gestellte Fragen direkt im Shop beantworten",
            "Live-Support-Funktion: Direkte Kommunikation zwischen Kunden und Supportteam möglich",
            "Für Shopware 5 & 6: Plugin wurde für beide Shopware-Versionen individuell entwickelt und angepasst"
        ],
        "tech": [
            "Shopware 5 & 6",
            "PHP",
            "REST-API",
            "JavaScript"
        ],
        "media_type": "image",
        "media": "/img/casestudy/shopware/chatbot4you.jpg",
        "schema_type": "SoftwareApplication",
        "application_category": "BusinessApplication"
    },
    {
        "category": "shopware",
        "variant": "full",
        "name": "Shopware 5 Rezept Plugin",
        "headline": "Rezeptliste mit Zusatzrechner",
        "intro": [
            "Entwicklung eines individuellen Shopware-5-Plugins zur Bereitstellung einer interaktiven Rezeptdatenbank für Tierhalter, die ihre Hunde oder Katzen nach dem BARF-Prinzip ernähren möchten.",
            "Ziel war es, Shop-Besucher:innen nicht nur Produkte anzubieten, sondern ihnen auch fundiertes Wissen und konkrete Rezepte rund ums BARFen bereitzustellen – direkt im Shop, mit direkter Verlinkung zu den passenden Produkten.",
            "Mit dem Plugin wird der Shop zum echten Kompetenzzentrum rund ums Thema BARF. Kund:innen erhalten nicht nur Produkte, sondern fundierte Informationen und maßgeschneiderte Rezepte – inklusive praktischer Einkaufshilfe. Das Plugin wurde von Grund auf selbst entwickelt und erweitert Shopware 5 um eine eigenständige Rezeptverwaltung."
        ],
        "features": [
            "Rezeptdatenbank für Hunde und Katzen",
            "Detaillierte Zutatenlisten je Rezept",
            "Direkte Verlinkung zu Shop-Produkten, damit alle Zutaten bequem im Warenkorb landen",
            "Zutatenrechner: basierend auf dem Gewicht des Tieres werden die exakten Mengen der Zutaten berechnet – individuell für jedes Rezept"
        ],
        "tech": [
            "Shopware 5",
            "PHP",
            "Smarty",
            "MySQL",
            "JavaScript"
        ],
        "media_type": "image",
        "media": "/img/casestudy/shopware/Recipelist.jpg",
        "schema_type": "SoftwareApplication",
        "application_category": "BusinessApplication"
    },
    {
        "category": "shopware",
        "variant": "compact",
        "name": "Video Element",
        "headline": "",
        "intro": [
            "Ein Videoplayer, der eigene Videos aus der Shopware-Mediathek abspielt. Dadurch werden keine externen Video-Dienste benötigt."
        ],
        "features": [],
        "tech": [],
        "media_type": "image",
        "media": "/img/casestudy/shopware/videoelement.jpg",
        "schema_type": "",
        "application_category": ""
    },
    {
        "category": "shopware",
        "variant": "compact",
        "name": "Kategorie Socialmedia Element",
        "headline": "",
        "intro": [
            "Eine Kategorie in den verschiedenen Social Media Kanälen zu teilen, per E-Mail oder Whatsapp zu senden"
        ],
        "features": [],
        "tech": [],
        "media_type": "image",
        "media": "/img/casestudy/shopware/sharebox-open.jpg",
        "schema_type": "",
        "application_category": ""
    },
    {
        "category": "shopware",
        "variant": "compact",
        "name": "Produkt Futterrechner",
        "headline": "",
        "intro": [
            "Hier kann Produkten ein Rechner hinzugefügt werden um zu gewissen Kriterien Futtermittel zu bestimmen."
        ],
        "features": [],
        "tech": [],
        "media_type": "image",
        "media": "/img/casestudy/shopware/futterrechner.jpg",
        "schema_type": "",
        "application_category": ""
    },
    {
        "category": "shopware",
        "variant": "compact",
        "name": "Barfen Futterrechner SW 5 & 6",
        "headline": "",
        "intro": [
            "Ein komplexer Futterrechner für Einkaufs- und Erlebniswelten von Shopware."
        ],
        "features": [],
        "tech": [],
        "media_type": "image",
        "media": "/img/casestudy/shopware/fm_futtercalc.jpg",
        "schema_type": "",
        "application_category": ""
    },
    {
        "category": "react",
        "variant": "full",
        "name": "DartPlaner – Web- & App-Plattform",
        "headline": "Symfony · Next.js · PWA – in Entwicklung",
        "intro": [
            "DartPlaner ist eine umfangreiche Plattform zur Verwaltung von Dart-Ligen, -Turnieren und -Vereinen, die ich aktuell als Fullstack-Projekt entwickle. Sie ist als API-getriebenes System mit mehreren eigenständigen Anwendungen aufgebaut.",
            "Ein Backend mit Symfony und API Platform (PostgreSQL, Redis, Echtzeit über Mercure) bildet die Datenbasis – modelliert nach Domain-Driven-Design über mehrere Bounded Contexts. Darauf setzen mehrere Next.js-Anwendungen auf:",
            "Technische Schwerpunkte: offline-fähige PWAs mit lokaler Datenhaltung und Synchronisation, Echtzeit-Updates per WebSocket sowie eine sauber nach Domänen strukturierte Architektur. Das Projekt befindet sich in aktiver Entwicklung."
        ],
        "features": [
            "Admin-Dashboard – Verwaltung von Verbänden, Ligen, Saisons, Spielplänen und Statistiken",
            "Player-App (PWA) – mobile, offline-fähige App für Spieler inkl. Trainingsmodi",
            "Scorer-App (PWA) – eigenständiges, offline-fähiges Dart-Scoring"
        ],
        "tech": [
            "Symfony",
            "API Platform",
            "PostgreSQL",
            "Mercure",
            "Next.js",
            "React",
            "TypeScript",
            "PWA"
        ],
        "media_type": "image",
        "media": "/img/blog/code.jpg",
        "schema_type": "WebApplication",
        "application_category": "SportsApplication"
    },
    {
        "category": "react",
        "variant": "full",
        "name": "DartsConnect Netzwerk App",
        "headline": "React/Next Capstone Project",
        "intro": [
            "Im Zuge eines React/Next-Bootcamps habe ich eine Art Social-Network-App entwickelt, die Darts-Enthusiasten miteinander verbinden soll.",
            "Zunächst galt es, die Funktionen und Bereiche zu planen, die sich innerhalb der vorgegebenen Zeit umsetzen ließen.",
            "Nach Konzeption und Abstimmung habe ich die einzelnen Komponenten und das Layout selbst umgesetzt – eingebunden über einen Git-Workflow mit Pull-Requests, die im Team per Code-Review abgenommen wurden.",
            "Die App habe ich als Fullstack-Anwendung mit Next.js und einer MongoDB umgesetzt – der gesamte Code stammt von mir, darunter Authentifizierung, Benutzerprofile und das Chat-System. Aufgrund des knappen Zeitfensters lag der Fokus auf den Kern-Funktionalitäten.",
            "Aktuelle Funktionen:"
        ],
        "features": [
            "Register & Login",
            "Benutzer Profile und Rollen",
            "Spieler Übersicht",
            "Spieler Profil",
            "Favoriten / Freundeslisten",
            "One on One Chat",
            "Gruppen Chat"
        ],
        "tech": [
            "Next.js",
            "React",
            "MongoDB",
            "Mongoose",
            "Auth"
        ],
        "media_type": "video",
        "media": "/video/dartsconnect.mp4",
        "schema_type": "WebApplication",
        "application_category": "SocialNetworkingApplication"
    },
    {
        "category": "react",
        "variant": "full",
        "name": "Calendly Meeting Clone",
        "headline": "React/Next Meeting Planer",
        "intro": [
            "Im Rahmen eines Portfolios habe ich einen Calendly-ähnlichen Meeting-Planer mit Next.js entwickelt – komplett ohne Abo-Modell oder Einschränkungen, um Meetings schnell und einfach planen zu können.",
            "In der ersten Entwicklungsphase wurden die grundlegenden Funktionen umgesetzt. Die verfügbaren Termine wurden dabei zunächst aus einer statischen JSON-Datei geladen – wie in der Demo zu sehen. Für aktive Tage wurden entsprechende Time-Slots definiert, die – sofern verfügbar – vom Nutzer ausgewählt werden können. Die JSON-Struktur wurde dabei so aufgebaut, dass sich daraus direkt ein Datenbankschema ableiten lässt.",
            "Nach dem Abschluss dieser ersten Version folgte die Entwicklung einer datenbankgestützten Variante – erneut mit Next.js, nun in Kombination mit einer MongoDB. Diese Version wurde als Fullstack-Anwendung realisiert, inklusive eines Admin-Bereichs zur Pflege der Termine über eine API. Neue Buchungen werden dort gelistet und können durch den Betreiber bestätigt oder abgelehnt werden.",
            "Sobald ein Nutzer einen Termin bucht, werden die entsprechenden Informationen und Bestätigungen automatisiert per E-Mail sowohl an den Nutzer als auch an den Betreiber gesendet – ebenfalls über eine API."
        ],
        "features": [],
        "tech": [
            "Next.js",
            "React",
            "MongoDB",
            "REST-API",
            "Mail-API"
        ],
        "media_type": "component",
        "media": "CallEvent",
        "schema_type": "WebApplication",
        "application_category": "BusinessApplication"
    },
    {
        "category": "react",
        "variant": "full",
        "name": "Event Kalender Planer",
        "headline": "React/Next Event Planer",
        "intro": [
            "Dieser Event-Planer wurde mit React und Next.js entwickelt und ermöglicht die übersichtliche Verwaltung und Darstellung von Veranstaltungen in verschiedenen Ansichten wie Monat, Woche, Tag oder Jahr – ganz ähnlich wie man es von gängigen Kalender-Tools kennt.",
            "In der Monatsansicht lassen sich Termine visuell strukturiert erfassen und anzeigen. Jeder Event kann mit einem Titel, einer Beschreibung, einem Typ (z.B. Meeting, Geburtstag, Konferenz) sowie Zusatzinfos wie Uhrzeit oder Teilnehmer versehen werden. Mehrere Einträge am selben Tag werden gestapelt dargestellt und sind interaktiv anklickbar.",
            "Die Termin-Daten stammen in der aktuellen Version aus einer strukturierten JSON-Datei, wodurch sich die App leicht an eine datenbankgestützte Version mit Rollen- und Rechteverwaltung anbinden lässt.",
            "Die Ansicht ist voll responsiv und lässt sich flexibel auf verschiedene Anforderungen und Nutzergruppen anpassen – sei es als interne Projektübersicht, Eventkalender oder Booking-System."
        ],
        "features": [],
        "tech": [
            "Next.js",
            "React",
            "JSON"
        ],
        "media_type": "image",
        "media": "/img/casestudy/web/calendarapp.jpg",
        "schema_type": "WebApplication",
        "application_category": "BusinessApplication"
    },
    {
        "category": "react",
        "variant": "full",
        "name": "Multi-Step Web-Projekt Konfigurator",
        "headline": "React/Next Multistep Formular",
        "intro": [
            "Mit diesem interaktiven Multi-Step Konfigurator können Interessenten ihr geplantes Webprojekt Schritt für Schritt strukturieren und erste Anforderungen definieren – ganz ohne technisches Vorwissen.",
            "In mehreren logisch aufgebauten Abschnitten werden gezielte Fragen zu wichtigen Projektbereichen gestellt, darunter z.B. Zielsetzung, Funktionsumfang, Designvorstellungen, technische Anforderungen oder Zeitplan. Die Antworten lassen sich bequem per Klick auswählen oder in Textfeldern ergänzen.",
            "Am Ende wird der ausgefüllte Konfigurator über eine E-Mail-API an den Betreiber übermittelt. Auf Basis dieser Informationen kann eine erste Machbarkeitsanalyse erfolgen, um den Projektumfang besser einzuschätzen und ein individuelles, zielgerichtetes Angebot zu erstellen.",
            "Der Konfigurator ist flexibel erweiterbar und lässt sich auf verschiedene Use-Cases anpassen – z.B. für Websites, Shops, Plattformen oder individuelle Web-Apps."
        ],
        "features": [],
        "tech": [
            "Next.js",
            "React",
            "Mail-API"
        ],
        "media_type": "component",
        "media": "WebPage",
        "schema_type": "WebApplication",
        "application_category": "BusinessApplication"
    },
    {
        "category": "react",
        "variant": "full",
        "name": "Eigene Fullstack-Business-Plattform",
        "headline": "Next.js · React · MongoDB – produktiv im Einsatz",
        "intro": [
            "Was als CMS begann, ist zu einer vollständigen, selbst entwickelten Business-Plattform gewachsen – umgesetzt als Next.js-Fullstack-Anwendung mit MongoDB. Sie läuft produktiv (im Einsatz hinter Gambit24) und geht weit über ein klassisches CMS hinaus: Website, Kundenverwaltung und internes Projektmanagement in einem System.",
            "Konzept, Frontend, Backend, Adminbereich und ein eigenes Kundenportal habe ich eigenständig umgesetzt.",
            "Funktionsbereiche:",
            "Das Projekt zeigt, dass ich komplexe Fullstack-Anwendungen eigenständig konzipieren, bauen und produktiv betreiben kann."
        ],
        "features": [
            "CMS – dynamische Seiten & Navigationen, News, FAQ, Case Studies und Medienverwaltung mit Rich-Text-Editor",
            "CRM – Kunden, Angebote & Angebotsanfragen, Rechnungen, Nachrichten und Service-Pakete",
            "Projektmanagement – Projekte, To-dos, Zeiterfassung, Status-Updates und Controlling",
            "Kundenportal – eigener, geschützter Login-Bereich für Kunden",
            "Analytics – eigenes Tracking & Auswertungen (Besucher, Seitenaufrufe) mit Dashboards",
            "Rollen- & Rechteverwaltung, Termin-Buchung, Newsletter und Benachrichtigungen"
        ],
        "tech": [
            "Next.js",
            "React",
            "MongoDB",
            "NextAuth",
            "Recharts",
            "REST-API"
        ],
        "media_type": "image",
        "media": "/img/blog/code.jpg",
        "schema_type": "WebApplication",
        "application_category": "BusinessApplication"
    }
];
