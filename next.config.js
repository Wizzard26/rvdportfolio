/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compiler: {
        styledComponents: true,
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
