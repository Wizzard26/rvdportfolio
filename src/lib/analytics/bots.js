// Erkennt und kategorisiert Bots/Crawler anhand des User-Agents.
//
// Bewusst OHNE Node-Abhängigkeiten (reine reguläre Ausdrücke), damit die Datei
// auch im Proxy (Edge-Runtime) importiert werden kann. Der eigentliche DB-Schreib
// läuft in der Node-Route /api/botlog.
//
// Reihenfolge = Priorität; der erste Treffer gewinnt (Spezifisches vor Generischem,
// z. B. „Applebot-Extended" vor „Applebot"). `name` ist ein stabiler Anzeigename.

const BOTS = [
    // ── KI-Crawler & -Assistenten ──────────────────────────────────────────
    { re: /GPTBot/i,                 name: 'GPTBot (OpenAI)',        category: 'ai' },
    { re: /OAI-SearchBot/i,          name: 'OAI-SearchBot (OpenAI)', category: 'ai' },
    { re: /ChatGPT-User/i,           name: 'ChatGPT-User',           category: 'ai' },
    { re: /Claude-SearchBot/i,       name: 'Claude-SearchBot',       category: 'ai' },
    { re: /Claude-User/i,            name: 'Claude-User',            category: 'ai' },
    { re: /ClaudeBot/i,              name: 'ClaudeBot (Anthropic)',  category: 'ai' },
    { re: /anthropic-ai/i,           name: 'Anthropic',              category: 'ai' },
    { re: /Perplexity-User/i,        name: 'Perplexity-User',        category: 'ai' },
    { re: /PerplexityBot/i,          name: 'PerplexityBot',          category: 'ai' },
    { re: /Google-Extended/i,        name: 'Google-Extended',        category: 'ai' },
    { re: /Applebot-Extended/i,      name: 'Applebot-Extended',      category: 'ai' },
    { re: /Bytespider/i,             name: 'Bytespider (TikTok)',    category: 'ai' },
    { re: /Amazonbot/i,              name: 'Amazonbot',              category: 'ai' },
    { re: /meta-externalagent|Meta-ExternalAgent/i, name: 'Meta-ExternalAgent', category: 'ai' },
    { re: /CCBot/i,                  name: 'CCBot (Common Crawl)',   category: 'ai' },
    { re: /cohere-ai|Cohere/i,       name: 'Cohere',                 category: 'ai' },
    { re: /Diffbot/i,                name: 'Diffbot',                category: 'ai' },
    { re: /YouBot/i,                 name: 'YouBot (You.com)',       category: 'ai' },
    { re: /DuckAssistBot/i,          name: 'DuckAssistBot',          category: 'ai' },

    // ── Suchmaschinen ──────────────────────────────────────────────────────
    { re: /AdsBot-Google/i,          name: 'AdsBot-Google',          category: 'search' },
    { re: /Storebot-Google/i,        name: 'Storebot-Google',        category: 'search' },
    { re: /Googlebot/i,              name: 'Googlebot',              category: 'search' },
    { re: /bingbot|BingPreview|msnbot/i, name: 'Bingbot',            category: 'search' },
    { re: /DuckDuckBot|DuckDuckGo/i, name: 'DuckDuckBot',            category: 'search' },
    { re: /YandexBot|YandexImages/i, name: 'YandexBot',              category: 'search' },
    { re: /Baiduspider/i,            name: 'Baiduspider',            category: 'search' },
    { re: /Applebot/i,               name: 'Applebot',               category: 'search' },
    { re: /Slurp/i,                  name: 'Yahoo Slurp',            category: 'search' },
    { re: /SeznamBot|Seznam/i,       name: 'SeznamBot',              category: 'search' },
    { re: /PetalBot/i,               name: 'PetalBot (Huawei)',      category: 'search' },

    // ── SEO-/Marketing-Tools ───────────────────────────────────────────────
    { re: /AhrefsBot|AhrefsSiteAudit/i, name: 'AhrefsBot',           category: 'seo' },
    { re: /SemrushBot/i,             name: 'SemrushBot',             category: 'seo' },
    { re: /DotBot/i,                 name: 'DotBot (Moz)',           category: 'seo' },
    { re: /rogerbot/i,               name: 'rogerbot (Moz)',         category: 'seo' },
    { re: /MJ12bot/i,                name: 'MJ12bot (Majestic)',     category: 'seo' },
    { re: /BLEXBot/i,                name: 'BLEXBot',                category: 'seo' },
    { re: /DataForSeoBot/i,          name: 'DataForSeoBot',          category: 'seo' },
    { re: /Screaming Frog/i,         name: 'Screaming Frog',         category: 'seo' },

    // ── Sonstige: Vorschau/Social, Monitoring, Feeds, Bibliotheken ─────────
    { re: /facebookexternalhit|facebookcatalog/i, name: 'Facebook (Vorschau)', category: 'other' },
    { re: /Twitterbot/i,             name: 'Twitterbot',             category: 'other' },
    { re: /LinkedInBot/i,            name: 'LinkedInBot',            category: 'other' },
    { re: /WhatsApp/i,               name: 'WhatsApp',               category: 'other' },
    { re: /TelegramBot/i,            name: 'TelegramBot',            category: 'other' },
    { re: /Discordbot/i,             name: 'Discordbot',             category: 'other' },
    { re: /Slackbot/i,               name: 'Slackbot',               category: 'other' },
    { re: /redditbot|Pinterest|Embedly|Quora|Iframely/i, name: 'Social-/Link-Vorschau', category: 'other' },
    { re: /UptimeRobot|Pingdom|StatusCake|Better ?Uptime|monitor|uptime/i, name: 'Monitoring', category: 'other' },
    { re: /Chrome-Lighthouse|Lighthouse|PageSpeed|GTmetrix/i, name: 'Lighthouse/PageSpeed', category: 'other' },
    { re: /feedfetcher|Feedly|FeedBurner|feedparser/i, name: 'Feed-Reader',     category: 'other' },
    { re: /curl\//i,                 name: 'curl',                   category: 'other' },
    { re: /wget/i,                   name: 'wget',                   category: 'other' },
    { re: /python-requests|python-urllib|python-httpx/i, name: 'Python',        category: 'other' },
    { re: /axios|node-fetch|undici|Go-http-client|Java\/|okhttp|Guzzle/i, name: 'HTTP-Bibliothek', category: 'other' },
    { re: /HeadlessChrome|PhantomJS|Playwright|Puppeteer/i, name: 'Headless-Browser', category: 'other' },
];

// Generischer Fallback: alles, was sich als bot/crawler/spider ausweist.
const GENERIC = /(^|[^a-z])(bot|crawler|spider|scraper|slurp)([^a-z]|$)/i;

// Gibt { name, category } zurück, wenn der User-Agent ein Bot ist, sonst null.
export function detectBot(ua) {
    if (!ua || typeof ua !== 'string') return null; // leerer UA → nicht protokollieren
    for (const b of BOTS) {
        if (b.re.test(ua)) return { name: b.name, category: b.category };
    }
    if (GENERIC.test(ua)) return { name: 'Sonstiger Bot', category: 'other' };
    return null;
}

// Anzeige-Labels der Kategorien (feste Reihenfolge für das Admin-Panel).
export const BOT_CATEGORIES = {
    ai: 'KI-Crawler & -Assistenten',
    search: 'Suchmaschinen',
    seo: 'SEO-/Marketing-Tools',
    other: 'Sonstige',
};
