import { siteConfig } from '@/lib/seo';
import { getPosts, getDocsBySpace } from '@/lib/content/postsStore';
import { getSpaces } from '@/lib/content/docSpacesStore';
import { toIsoDate } from '@/lib/dateFormat';

// /llms.txt — kuratierte Einstiegsdatei für KI-Systeme (llmstxt.org-Konvention).
//
// Der kuratierte Kopf (Profil, Kontakt, Schwerpunkte, Qualifikationen) ist fest
// gepflegt; Blog-Beiträge und Doku-Seiten werden dynamisch aus content.db
// angehängt, damit neue Inhalte automatisch erscheinen. Ersetzt die frühere
// statische public/llms.txt.
export const dynamic = 'force-dynamic';

const abs = (path) => `${siteConfig.url}${path}`;

const HEADER = `# René van Dinter – Shopware- & Web-Developer

> Portfolio von René van Dinter (Stade, Metropolregion Hamburg, Niedersachsen,
> Deutschland). Shopware-Entwickler und Web-Entwickler mit über 15 Jahren
> Erfahrung aus Agentur und E-Commerce. Schwerpunkte: Shopware-6-Plugins, -Apps
> und -Storefront-Themes, Frontends und Web-Apps mit JavaScript, React und
> Next.js, dazu PHP/Symfony, REST-APIs, Git und Docker. Besonderheit: gelernter
> Mediengestalter Digital und Print — Entwickler, der Design und UX mitdenkt.

Diese Datei fasst die Website maschinenlesbar zusammen (siehe llmstxt.org).
Inhalte sind deutschsprachig. Die Seite setzt keine Cookies und kein Tracking.
Vollständige Blog- und Doku-Inhalte im Klartext: https://rene-van-dinter.de/llms-full.txt

## Verfügbarkeit

- Aktuell offen für eine neue Festanstellung als Shopware-Entwickler / Web-Entwickler.
- Arbeitsmodell: remote, hybrid oder vor Ort im Raum Hamburg / Stade / Niedersachsen.
- Für passende Freelance-Projekte ebenfalls ansprechbar.

## Kontakt

- Website: https://rene-van-dinter.de
- E-Mail: info@rene-van-dinter.de
- Telefon: +49 174 9327538
- Standort: Stade, Metropolregion Hamburg (Niedersachsen, Deutschland)
- GitHub: https://github.com/Wizzard26
- LinkedIn: https://www.linkedin.com/in/rene-van-dinter-6a5a2b14a/
- Xing: https://www.xing.com/profile/Rene_vanDinter/cv

## Seiten

- [Start](https://rene-van-dinter.de/): Überblick über Profil, Aufgabengebiete
  (Shopware-Entwicklung, Frontend & Web-Apps, Design & UX, Zusammenarbeit) und
  Kontaktmöglichkeiten.
- [Über mich](https://rene-van-dinter.de/about-me): Werdegang vom
  Mediengestalter über Webdesign zur Entwicklung, Kenntnisse mit
  Selbsteinschätzung, Arbeitsweise und Haltung zur Weiterbildung.
- [Vita](https://rene-van-dinter.de/vita): Beruflicher Werdegang mit allen
  Stationen, Zeiträumen und Aufgaben. Persönliche Daten, Sprachkenntnisse,
  Qualifikationen sowie Zeugnisse und Zertifikate als PDF.
- [Shopware-Entwickler (Raum Hamburg)](https://rene-van-dinter.de/shopware-entwickler):
  Profil-/Verfügbarkeitsseite – Shopware-6- & Web-Entwickler, offen für Festanstellung
  (remote/hybrid/vor Ort), Tech-Stack und Schwerpunkte.
- [Showcase](https://rene-van-dinter.de/showcase): Referenzen und Case Studys,
  gegliedert nach Shopware, React/Next.js, JavaScript, Layouts, Logos und Print.
- [Blog](https://rene-van-dinter.de/blog): Beiträge zu Shopware, Webentwicklung
  und E-Commerce.
- [Dokumentation](https://rene-van-dinter.de/docs): Anleitungen und Referenzen,
  gegliedert nach eigenständigen Doku-Bereichen.
- [Kontakt](https://rene-van-dinter.de/contact): Kontaktformular, E-Mail und
  Telefon.

## Fachliche Schwerpunkte

- Shopware 6: Plugin-Entwicklung, App-Entwicklung, Storefront- und
  Theme-Entwicklung, Anbindung externer Dienste per API
- Frontend: JavaScript, React, Next.js, HTML, CSS, SASS/LESS, Twig
- Backend: PHP, Symfony, Node.js, REST-APIs, MySQL/MariaDB
- Werkzeuge: Git, Docker (eigene, containerbasierte Entwicklungs-Setups),
  PhpStorm
- Gestaltung: Mediengestaltung Digital und Print, UI/UX, Adobe Creative Cloud,
  Affinity Designer

## Qualifikationen

- Ausbildung: Mediengestalter Digital und Print (IHK), Fachrichtung Gestaltung
  und Technik — IBB-Buxtehude
- Shopware 5: Certified Template Developer
- Shopware 6: Certified Template Designer
- JavaScript Developer — alfatraining Bildungszentrum GmbH
- Certified PHP Developer — alfatraining Bildungszentrum GmbH
- Web-Developer React.js / Next.js — neue fische

## Sprachen

- Deutsch: Muttersprache
- Englisch: sicher in Wort und Schrift (beruflicher Kontext)`;

const FOOTER = `## Optional

- [Impressum](https://rene-van-dinter.de/imprint): Anbieterkennzeichnung nach § 5 DDG.
- [Datenschutzerklärung](https://rene-van-dinter.de/disclaimer): keine Cookies,
  kein Tracking; Verarbeitung nur für Hosting und Kontaktanfragen.`;

const oneLine = (s) => (s || '').replace(/\s+/g, ' ').trim();

export function GET() {
    const parts = [HEADER];

    // Blog-Beiträge (nur aktive).
    let posts = [];
    try { posts = getPosts({ type: 'blog', publicOnly: true }); } catch { /* Build ohne DB */ }
    if (posts.length) {
        const items = posts.map((p) => {
            const iso = toIsoDate(p.published_at);
            const meta = [iso, oneLine(p.teaser)].filter(Boolean).join(' – ');
            return `- [${p.title}](${abs(`/blog/${p.slug}`)})${meta ? `: ${meta}` : ''}`;
        });
        parts.push(`## Blog\n\n${items.join('\n')}`);
    }

    // Dokumentationen (je Bereich, nur aktive mit Seiten).
    let spaces = [];
    try { spaces = getSpaces({ publicOnly: true }); } catch { /* Build ohne DB */ }
    const activeSpaces = spaces
        .map((s) => ({ space: s, docs: getDocsBySpace(s.id, { publicOnly: true }) }))
        .filter((x) => x.docs.length > 0);

    if (activeSpaces.length) {
        const blocks = activeSpaces.map(({ space, docs }) => {
            const head = `### ${space.name}${space.description ? ` — ${oneLine(space.description)}` : ''}`;
            const items = docs.map((d) => {
                const t = oneLine(d.teaser);
                return `- [${d.title}](${abs(`/docs/${space.slug}/${d.slug}`)})${t ? `: ${t}` : ''}`;
            });
            return `${head}\n${items.join('\n')}`;
        });
        parts.push(`## Dokumentation\n\n${blocks.join('\n\n')}`);
    }

    parts.push(FOOTER);

    return new Response(`${parts.join('\n\n')}\n`, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
