// Seed-Quelle für die Design-Galerien (Grafik & Webdesign-Tab).
//
// Erzeugt aus den bisherigen statischen Quellen (casestudys.js caseWebEntries +
// den Logo-/Print-Arrays aus ShowLogos.js/ShowPrints.js). Wird beim ersten Laden
// in die Tabelle gallery_items geseedet; danach im Admin pflegbar. Bleibt als
// Seed-Quelle bestehen (wie showcaseProjects.js / vita.js).
//
// gallery: "ecommerce" | "website" | "logo" | "print"
// Für Logos/Print zählt nur title (Alt-Text) + image; description/technik leer.

// Konstanten hier (client-sicher, keine Server-Importe) — von galleryStore.js
// (Server) und GalleryItemList.js (Client) gemeinsam genutzt.
export const GALLERIES = ['ecommerce', 'website', 'logo', 'print'];

export const GALLERY_LABELS = {
    ecommerce: 'E-Commerce Layouts',
    website: 'Web Layouts',
    logo: 'Logo Designs',
    print: 'Print Designs',
};

export const galleryItems = [
    {
        "gallery": "ecommerce",
        "title": "Dark Gold Fashion",
        "description": "Shopware Layout für einen Fashion Store. Dunkel, Edel und ebenso schlicht gehaltenes Design",
        "technik": "Shopware",
        "image": "/img/casestudy/web/DarkGold.jpg"
    },
    {
        "gallery": "ecommerce",
        "title": "SmartHome Store",
        "description": "Design für Shopware in zwei Basisfarben mit verschiedenen Akzenten. Aufgeräumtes und Cleanes Layout, welches die wichtigsten Elemente im Focus zeigt.",
        "technik": "Shopware",
        "image": "/img/casestudy/web/smarthome_start.jpg"
    },
    {
        "gallery": "ecommerce",
        "title": "Rauchbar Tabakhandel",
        "description": "Alles zum Anzünden Shopware Layout eines Online-Shops für Raucher Ware und Zubehör.",
        "technik": "Shopware",
        "image": "/img/casestudy/web/Rauchbar_start.jpg"
    },
    {
        "gallery": "ecommerce",
        "title": "Der Grillshop",
        "description": "Ein Shop mit allem was man zum Grillen braucht. Produkte, Aktionen und Rezepte übersichtlich dargestellt für eine Schnelle Navigation durch dem Store.",
        "technik": "Shopware",
        "image": "/img/casestudy/web/weblayoutgrill.png"
    },
    {
        "gallery": "ecommerce",
        "title": "Cascade Darts",
        "description": "Dartshop Layout mit immer wieder wechselnden Angeboten und Aktionen. Dieses Layout lebt von einer sich fortwährend ändernden Produktpalette.",
        "technik": "Shopware",
        "image": "/img/casestudy/web/darttheme.jpg"
    },
    {
        "gallery": "ecommerce",
        "title": "BOMBFROG Uhren",
        "description": "Ein Layout Konzept für eine kleine Inländische Uhrenmanufaktur, welche sich auf Chronographen für besondere Anforderungen spezialisiert hat.",
        "technik": "Shopware",
        "image": "/img/casestudy/web/bombfroglayout.jpg"
    },
    {
        "gallery": "website",
        "title": "Agency Layout",
        "description": "Einfaches Layout für eine Agentur. Mit einem konzeptualen Design und einer einfachen Navigation.",
        "technik": "Wordpress",
        "image": "/img/casestudy/web/demoagency.jpg"
    },
    {
        "gallery": "website",
        "title": "Limousinen-Service",
        "description": "Landingpage für einen Limousinen-Service, erstellt auf Grundlage eines Wettbewerbs.",
        "technik": "Wordpress",
        "image": "/img/casestudy/web/limoservice.jpg"
    },
    {
        "gallery": "website",
        "title": "Mensakeller Club",
        "description": "Designentwurf für einen Studenten Club auf Basis von Wordpress und einem Aussagekräftigen Briefings. Der Entwurf war ein Konzept zu einem Designwettbewerb.",
        "technik": "Wordpress",
        "image": "/img/casestudy/web/mensakeller.jpg"
    },
    {
        "gallery": "website",
        "title": "Gambit24 Media",
        "description": "Designkonzept einer Agentur-Website mit Schwerpunkt auf Shopware-, Contao- und Next.js-Entwicklung.",
        "technik": "NextJs",
        "image": "/img/casestudy/web/gambit24_prev.png"
    },
    {
        "gallery": "website",
        "title": "Faircollect",
        "description": "Landingpage Konzept einer Beratungsseite als Wettbewerbsergebnis.",
        "technik": "Wordpress",
        "image": "/img/casestudy/web/Faircollect.png"
    },
    {
        "gallery": "website",
        "title": "GBS-Nord",
        "description": "Webseite für ein kleines mittelständisches Unternehmen, das auf Tankkorrosionsschutz spezialisiert ist.",
        "technik": "Contao",
        "image": "/img/casestudy/web/gbs-web.png"
    },
    {
        "gallery": "logo",
        "title": "Landhotel Kirchberger",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/logo/LandhotelKirchberger1.jpg"
    },
    {
        "gallery": "logo",
        "title": "Medexo",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/logo/medexo.jpg"
    },
    {
        "gallery": "logo",
        "title": "Sannova",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/logo/sannova.png"
    },
    {
        "gallery": "logo",
        "title": "Tomate Basilic",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/logo/tomateBasilic.jpg"
    },
    {
        "gallery": "logo",
        "title": "Prinz Immobilien",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/logo/prinzImmo3_2.jpg"
    },
    {
        "gallery": "logo",
        "title": "Roomlab",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/logo/roomlab.png"
    },
    {
        "gallery": "logo",
        "title": "Rene van Dinter",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/logo/Logo-Block.png"
    },
    {
        "gallery": "logo",
        "title": "Chauffeur College",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/logo/tcc-logo.png"
    },
    {
        "gallery": "logo",
        "title": "Vitales",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/logo/vita-logo.png"
    },
    {
        "gallery": "logo",
        "title": "GBS Nord",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/logo/gbsnord-logo.png"
    },
    {
        "gallery": "logo",
        "title": "Clix AG",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/logo/cklix.jpg"
    },
    {
        "gallery": "logo",
        "title": "Survival New Order",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/logo/Survival_Logo.jpg"
    },
    {
        "gallery": "print",
        "title": "Cascade Darts",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/print/cascade.png"
    },
    {
        "gallery": "print",
        "title": "Reiser Ärzte",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/print/dr_reiser.png"
    },
    {
        "gallery": "print",
        "title": "EWS Windenergy",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/print/EWS_Windenergy.png"
    },
    {
        "gallery": "print",
        "title": "Andres kleine Kneipe",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/print/flyerKleineKneipe.png"
    },
    {
        "gallery": "print",
        "title": "GBS Nord",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/print/gbs_nord.webp"
    },
    {
        "gallery": "print",
        "title": "Wozny Photography",
        "description": "",
        "technik": "",
        "image": "/img/casestudy/print/woznyCD.jpg"
    }
];
