/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compiler: {
        styledComponents: true,
    },
    // Nicht bündeln, sondern zur Laufzeit aus node_modules laden:
    // - better-sqlite3 ist ein natives Modul (kompilierte .node-Binärdatei)
    // - geoip-lite lädt seine Länder-Datendateien (.dat) per __dirname
    // Beim Bündeln würden die Pfade brechen (ENOENT auf die .dat-Datei).
    serverExternalPackages: ['better-sqlite3', 'geoip-lite'],
    async headers() {
        return [
            // Repo-PDFs (z. B. /document/Vita.pdf) werden statisch von Next
            // ausgeliefert und sind das Ziel der /download/…-Redirects. Sie sind
            // private/geteilte Dateien → nicht indexieren. Die dynamischen
            // Datei-Routen (/documents, /freigabe/…/download) setzen den Header
            // selbst.
            {
                source: '/document/:path*',
                headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
            },
        ]
    },
    async redirects() {
        return [
            // www → non-www.
            //
            // Bisher lieferten https://rene-van-dinter.de und
            // https://www.rene-van-dinter.de beide Status 200 mit identischem
            // Inhalt. Für Suchmaschinen sind das zwei vollständige Kopien der
            // Seite, die sich gegenseitig Konkurrenz machen und die Linkkraft
            // aufteilen (Duplicate Content).
            //
            // Kanonisch ist die Variante ohne www (siehe `siteConfig.url`).
            // 308 = permanent, Methode bleibt erhalten; Suchmaschinen
            // übertragen die Bewertung damit auf das Ziel.
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'www.rene-van-dinter.de' }],
                destination: 'https://rene-van-dinter.de/:path*',
                permanent: true,
            },
        ]
    },
}

module.exports = nextConfig
