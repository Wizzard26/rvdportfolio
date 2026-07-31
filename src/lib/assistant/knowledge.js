import { getStations } from '@/lib/content/vitaStore';
import { getProjects } from '@/lib/content/showcaseStore';
import { getPosts } from '@/lib/content/postsStore';
import { getAreasWithEntries } from '@/lib/content/vitaPersonalStore';

// Baut die Wissensbasis des CV-Assistenten aus den echten Inhalten (content.db)
// plus einer kleinen Menge kuratierter Profil-Fakten. Jeder "Chunk" hat:
//   text     – für das Retrieval (matching), enthält Titel + Kontext
//   detail   – saubere Kurzbeschreibung für die Anzeige (ohne Label-Wiederholung)
//   title    – Anzeigename / Link-Label
//   url      – Quelle inkl. Section-Anker (#…), damit der Link direkt hinscrollt
// Der Assistent antwortet AUSSCHLIESSLICH aus diesen Chunks — er erfindet nichts.

const CATEGORY_LABEL = {
    shopware: 'Shopware',
    react: 'Next.js / React',
    codejs: 'JavaScript',
    grafik: 'Grafik & Webdesign',
};

// Flaggschiff-Projekte: erhalten im Retrieval einen Ranking-Bonus, damit sie bei
// passenden Fragen zuverlässig vorn stehen. Abgleich per Namens-Teilstring.
const FLAGSHIP_PROJECTS = ['calculator builder'];

function stripHtml(s = '') {
    return String(s)
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function clip(s, n = 300) {
    const t = stripHtml(s);
    return t.length > n ? `${t.slice(0, n).trim()}…` : t;
}

// Kuratierte Profil-Fakten — decken die häufigsten Fragen sicher ab.
const PROFILE_CHUNKS = [
    {
        id: 'profile-identity',
        kind: 'profil',
        title: 'Über René van Dinter',
        detail: 'Shopware-6- & Web-Developer aus Stade (Metropolregion Hamburg) mit Mediengestalter-Hintergrund und über 15 Jahren Erfahrung aus Agentur und E-Commerce.',
        text: 'Über René van Dinter: Shopware-6- und Web-Developer aus Stade in der Metropolregion Hamburg, Mediengestalter-Hintergrund, über 15 Jahre Erfahrung aus Agentur und E-Commerce.',
        url: '/about-me',
        keywords: 'über stell vorstellen vorstell steckbrief profil name heisst wie heisst developer entwickler mediengestalter hamburg stade hintergrund person background jahre erfahrung',
    },
    {
        id: 'profile-availability',
        kind: 'profil',
        title: 'Verfügbarkeit',
        detail: 'Verfügbar ab sofort. Offen für eine neue Festanstellung – remote, hybrid oder vor Ort; im Raum Hamburg pendel- und umzugsbereit.',
        text: 'Verfügbarkeit: René ist ab sofort verfügbar und offen für eine neue Festanstellung – remote, hybrid oder vor Ort. Im Raum Hamburg pendel- und umzugsbereit. Wann kann er anfangen: sofort, ab sofort.',
        url: '/shopware-entwickler#verfuegbarkeit',
        keywords: 'verfügbar verfügbarkeit ab sofort wann start starten beginnen anfangen kündigungsfrist festanstellung anstellung remote hybrid vor ort umzug pendeln umzugsbereit jobsuche offen suchst du arbeit frei',
    },
    {
        id: 'profile-tech',
        kind: 'profil',
        title: 'Technologien & Skills',
        detail: 'Shopware 6 (Plugins, Apps, Storefront-Themes), Frontend mit JavaScript/React/Next.js, Backend mit PHP/Symfony, REST-APIs, MySQL, Git und Docker – plus Design/UX.',
        text: 'Technologien & Skills: Shopware 6 (Plugins, Apps, Storefront-Themes), Frontend mit JavaScript, React und Next.js, Backend mit PHP/Symfony, REST-APIs und MySQL, dazu Git und Docker. Headless / kopflos Commerce. Design und UX durch Mediengestalter-Ausbildung.',
        url: '/shopware-entwickler#mitbringen',
        keywords: 'skills technologien tech stack kenntnisse können fähigkeiten womit arbeitest du shopware react nextjs next.js php symfony javascript typescript docker git mysql rest api frontend backend headless kopflos commerce design ux node',
    },
    {
        id: 'profile-architektur',
        kind: 'profil',
        title: 'Architektur, Clean Code & Testing',
        // Anzeige darf „Design-Patterns" sagen; das MATCHING (text/keywords) meidet
        // bewusst das nackte Wort „design", damit „Design Patterns" nicht mit dem
        // grafischen „Design" kollidiert. Boost hebt den Treffer bei „patterns" an.
        detail: 'Sauberer, wartbarer Aufbau ist mir wichtig: objektorientiert mit Design-Patterns (Entwurfsmustern), die ich in meinen PHP- und JavaScript-Weiterbildungen gelernt habe. In Next.js baue ich service-orientiert bzw. „microservice"-artig mit klar getrennten API-Routes. Unit-Tests und test-getriebene Entwicklung (TDD) setze ich ein – der Umfang hängt vom Projekt ab. Für die Details sprich mich gern direkt an.',
        text: 'Architektur, Clean Code und Testing: objektorientiert mit Entwurfsmustern aus den PHP- und JavaScript-Weiterbildungen. In Next.js service-orientiert bzw. microservice-artig mit getrennten API-Routes. Unit-Tests und test-getriebene Entwicklung (TDD) im Einsatz, Umfang je nach Projekt.',
        url: '/shopware-entwickler#mitbringen',
        keywords: 'patterns entwurfsmuster entwurfsmustern cleancode clean sauberer wartbar oop objektorientiert solid prinzipien architektur microservice microservices serviceorientiert apiroutes unittest unittests unit test tests tdd testdriven testgetrieben testing qualitaet abstraktion entkopplung',
        boost: 2,
    },
    {
        id: 'profile-contact',
        kind: 'profil',
        title: 'Kontakt aufnehmen',
        detail: 'Am schnellsten über das Kontaktformular – dort kann man auch direkt ein Angebot machen („umgekehrte Bewerbung").',
        text: 'Kontakt aufnehmen: am schnellsten über das Kontaktformular. Dort kann man auch direkt ein Angebot machen (umgekehrte Bewerbung).',
        url: '/contact',
        keywords: 'kontakt erreichen email mail telefon anschreiben bewerben angebot machen gespräch termin melden erreichbar wie kann ich',
    },
];

export function buildKnowledge() {
    const chunks = [...PROFILE_CHUNKS];

    // Berufserfahrung (nur aktive/öffentliche Stationen)
    for (const s of getStations({ publicOnly: true })) {
        const period = `${s.start || ''}${s.is_current ? '–heute' : s.end ? `–${s.end}` : ''}`.trim();
        chunks.push({
            id: `vita-${s.id}`,
            kind: 'vita',
            title: `${s.title}${s.company ? ` · ${s.company}` : ''}`,
            detail: `${period ? `${period}. ` : ''}${clip(s.description, 260)}`.trim(),
            text: `Berufserfahrung: ${s.title}${s.company ? ` bei ${s.company}` : ''}${period ? ` (${period})` : ''}. ${clip(s.description, 500)}`.trim(),
            url: `/vita#vita-${s.id}`,
            keywords: `${s.title} ${s.company || ''} berufserfahrung werdegang station stelle position job erfahrung gearbeitet tätigkeit`,
        });
    }

    // Showcase-Projekte (nur aktive)
    for (const p of getProjects({ publicOnly: true })) {
        const cat = CATEGORY_LABEL[p.category] || p.category;
        const feats = (p.features || '').split(/\r?\n/).map((f) => f.trim()).filter(Boolean).join('; ');
        const isFlagship = FLAGSHIP_PROJECTS.some((n) => (p.name || '').toLowerCase().includes(n));
        chunks.push({
            id: `project-${p.id}`,
            kind: 'projekt',
            title: p.name,
            detail: `${p.headline ? `${p.headline}. ` : ''}${clip(p.intro, 220)}`.trim(),
            text: `Projekt (${cat}): ${p.name}${p.headline ? ` — ${p.headline}` : ''}. ${clip(p.intro, 400)}${p.tech ? ` Tech: ${p.tech}.` : ''}${feats ? ` Features: ${clip(feats, 300)}` : ''}`.trim(),
            url: `/showcase#project-${p.id}`,
            keywords: `${p.name} ${cat} ${p.tech || ''} projekt referenz case study showcase beispiel gebaut umgesetzt entwickelt plugin app`,
            boost: isFlagship ? 3 : 0,
        });
    }

    // Blog-Artikel (nur aktive)
    for (const post of getPosts({ type: 'blog', publicOnly: true })) {
        chunks.push({
            id: `blog-${post.id}`,
            kind: 'blog',
            title: post.title,
            detail: `${post.subline ? `${post.subline}. ` : ''}${clip(post.teaser, 220)}`.trim(),
            text: `Blog-Artikel: ${post.title}${post.subline ? ` — ${post.subline}` : ''}. ${clip(post.teaser, 300)}`.trim(),
            url: `/blog/${post.slug}`,
            keywords: `${post.title} ${post.category || ''} blog artikel beitrag geschrieben thema`,
        });
    }

    // „Auf einen Blick" / persönliche Bereiche (bereits öffentlich auf /vita)
    for (const area of getAreasWithEntries()) {
        const entriesText = (area.entries || []).map((e) => stripHtml(e.text)).filter(Boolean).join('; ');
        if (!entriesText) continue;
        chunks.push({
            id: `area-${area.id}`,
            kind: 'profil',
            title: area.title || 'Auf einen Blick',
            detail: clip(entriesText, 240),
            text: `${area.title || 'Auf einen Blick'}: ${clip(entriesText, 500)}`,
            url: '/vita#persoenliche-daten',
            keywords: `${area.title || ''} ${entriesText} auf einen blick persönliche daten überblick`,
        });
    }

    return chunks;
}
