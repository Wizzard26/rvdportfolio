// „Soft Topics" — kuratierte Überblick-Antworten für Themen, die NICHT direkt in
// den Unterlagen stehen, aber zum Profil gehören. Sie greifen nur als Zwischen-
// schicht: Findet die harte Wissensbasis (echte Dokumente) nichts, prüft der
// Assistent hier. Völlig fremde Themen (Java, kochen …) bleiben verneint.
//
// Jede Antwort ist bewusst UMRISSEN und endet mit dem Hinweis, für Details direkt
// Kontakt aufzunehmen. Struktur wie ein Wissens-Chunk (title/keywords/text), damit
// dasselbe Retrieval greift; `detail` ist der Anzeigetext.

export function buildSoftTopics() {
    const T = [
        {
            id: 'soft-seo',
            title: 'On-Page-SEO',
            detail: 'Ja – On-Page-SEO gehört zu meiner Arbeit: sauberes, semantisches HTML, sinnvolle Meta-Angaben und Open Graph, strukturierte Daten (JSON-LD), klare URLs, Sitemap/robots und schnelle Ladezeiten (Core Web Vitals). Diese Seite selbst ist so aufgebaut. Für Off-Page/Linkaufbau arbeite ich mit Partnern. Für ein konkretes Vorhaben sprich mich gern direkt an.',
            keywords: 'seo onpage onepage on-page suchmaschinenoptimierung suchmaschine ranking sichtbarkeit meta metadaten strukturierte daten json-ld sitemap robots indexierung google auffindbarkeit',
        },
        {
            id: 'soft-a11y',
            title: 'Barrierefreiheit',
            detail: 'Barrierefreiheit denke ich mit: semantisches HTML, Tastaturbedienbarkeit, ausreichende Kontraste und sinnvolle ARIA-Auszeichnung – orientiert an WCAG und dem BFSG. Für eine konkrete Prüfung oder Umsetzung melde dich gern.',
            keywords: 'barrierefreiheit barrierearm barrierefrei accessibility a11y wcag bfsg zugänglich screenreader kontrast tastatur inklusion',
        },
        {
            id: 'soft-performance',
            title: 'Performance & Core Web Vitals',
            detail: 'Performance ist fester Bestandteil: schlanke Assets, Caching, Bild-Optimierung und ein Auge auf die Core Web Vitals (LCP, CLS, INP). Für eine gezielte Optimierung deines Shops/Projekts sprich mich an.',
            keywords: 'performance geschwindigkeit ladezeit ladezeiten core web vitals lcp cls inp pagespeed schnell optimierung caching schnelligkeit',
        },
        {
            id: 'soft-dsgvo',
            title: 'Datenschutz / DSGVO',
            detail: 'Datenschutz baue ich von Anfang an ein – zum Beispiel eine cookiefreie, anonyme Auswertung ganz ohne Cookie-Banner (wie auf dieser Seite) und generell datensparsame Umsetzung. Für rechtssichere Details ziehe bitte zusätzlich fachkundige Beratung hinzu bzw. sprich mich an.',
            keywords: 'dsgvo datenschutz cookie cookies cookieless cookiefrei privacy einwilligung consent bannerlos tracking datensparsam',
        },
        {
            id: 'soft-api',
            title: 'Schnittstellen & API-Anbindung',
            detail: 'Schnittstellen sind Alltag: Anbindung externer Dienste per REST-API, Import/Export sowie ERP-, PIM- oder Zahlungs-Integrationen – besonders im Shopware-Umfeld. Für dein konkretes System sprich mich an.',
            keywords: 'schnittstelle schnittstellen api rest anbindung integration integrationen erp pim webhook import export zahlung payment drittanbieter externe dienste',
        },
        {
            id: 'soft-maintenance',
            title: 'Wartung & Support',
            detail: 'Wartung und Support gehören dazu: Updates, Fehlerbehebung und Weiterentwicklung bestehender Plugins und Shops. Für ein laufendes Setup oder einen Support-Bedarf melde dich gern.',
            keywords: 'wartung support pflege betreuung updates aktualisierung fehler bugfix bugs weiterentwicklung service betrieb monitoring',
        },
        {
            id: 'soft-migration',
            title: 'Migration & Relaunch',
            detail: 'Migrationen und Relaunches – etwa der Umstieg auf Shopware 6 – begleite ich: Datenübernahme, Theme-Neuaufbau und saubere Umzüge. Für dein Vorhaben sprich mich an.',
            keywords: 'migration migrieren relaunch umzug umstieg wechsel shopware5 shopware6 datenübernahme upgrade neuaufbau portierung',
        },
        {
            id: 'soft-konditionen',
            title: 'Gehalt & Konditionen',
            detail: 'Zu Gehalt, Stundensatz und Konditionen sprich mich bitte direkt an – das klären wir am besten persönlich und passend zur jeweiligen Rolle.',
            keywords: 'gehalt gehaltswunsch gehaltsvorstellung verdienst verdienen konditionen stundensatz tagessatz honorar rate preis kosten teuer bezahlung vergütung salary rate',
        },
        {
            id: 'soft-cicd',
            title: 'CI/CD & Deployment',
            detail: 'Deployments automatisiere ich – z. B. per GitHub Actions und Container (Docker), Auslieferung über eine Container-Registry. Diese Seite wird genau so ausgeliefert. Für dein konkretes Setup sprich mich gern an.',
            keywords: 'ci cd ci/cd continuous integration deployment deploy pipeline pipelines github actions gitlab docker container registry auslieferung release build automatisierung devops',
        },
        {
            id: 'soft-git',
            title: 'Git-Workflow',
            detail: 'Ich arbeite Git-basiert mit Feature-Branches und Pull-Requests inkl. Review vor dem Merge in den Hauptzweig. Für Details zum Workflow sprich mich an.',
            keywords: 'git branch branching branches feature-branch pull request pr merge review workflow versionierung commit trunk',
        },
        {
            id: 'soft-agile',
            title: 'Agile Arbeitsweise & Projektleitung',
            detail: 'In Teamleitung und Projektmanagement (u. a. bei Rhinos-Media) habe ich agil gearbeitet: Aufwandsschätzungen, To-do-Vergabe, Qualitätsmanagement und die Planung von Livegängen. Für Details sprich mich an.',
            keywords: 'agil agile scrum kanban sprint sprints backlog standup projektmanagement projektleitung aufwandsschätzung planning zusammenarbeit teamarbeit vorgehen methodik',
        },
        {
            id: 'soft-qa',
            title: 'Code-Reviews & Qualitätssicherung',
            detail: 'Qualität sichere ich zusätzlich über Code-Reviews und funktionale/manuelle Tests. Für Details zum Vorgehen sprich mich an.',
            keywords: 'codereview code-review reviews review qualitätssicherung qa linting pair-programming abnahme',
        },
    ];
    return T.map((t) => ({ ...t, kind: 'thema', soft: true, url: '/contact', text: `${t.title}. ${t.detail}` }));
}
