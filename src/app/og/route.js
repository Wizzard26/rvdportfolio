import { ImageResponse } from 'next/og';

// Dynamisches OG-Vorschaubild pro Artikel: /og?title=…&kind=…
//
// Bewusst NICHT unter /api/ (das ist in robots.txt gesperrt) — Social-/KI-Scraper
// müssen das og:image laden dürfen. Design entspricht app/opengraph-image.js
// (Marke), nur mit dem Beitragstitel statt der festen Portfolio-Zeile.

const colors = {
    primary: 'rgb(63, 104, 126)',
    primaryDark: 'rgb(55, 85, 103)',
    secondary: 'rgb(198, 62, 86)',
    light: 'rgb(250, 250, 250)',
};

// Titelgröße an die Länge anpassen, damit lange Titel nicht überlaufen.
function titleFontSize(len) {
    if (len > 90) return 46;
    if (len > 60) return 58;
    if (len > 35) return 70;
    return 82;
}

export function GET(request) {
    const { searchParams } = new URL(request.url);
    const title = (searchParams.get('title') || 'René van Dinter').slice(0, 120);
    const kind = (searchParams.get('kind') || 'Portfolio').slice(0, 40);

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '80px',
                    background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
                    color: colors.light,
                }}
            >
                <div
                    style={{
                        fontSize: 30,
                        letterSpacing: 6,
                        textTransform: 'uppercase',
                        opacity: 0.75,
                    }}
                >
                    {kind}
                </div>

                <div
                    style={{
                        fontSize: titleFontSize(title.length),
                        fontWeight: 700,
                        marginTop: 16,
                        lineHeight: 1.12,
                        display: 'flex',
                    }}
                >
                    {title}
                </div>

                <div
                    style={{
                        width: 180,
                        height: 10,
                        background: colors.secondary,
                        margin: '32px 0',
                        borderRadius: 5,
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: 'auto',
                        fontSize: 28,
                        opacity: 0.85,
                    }}
                >
                    <div>René van Dinter · Shopware- &amp; Web-Developer</div>
                    <div>rene-van-dinter.de</div>
                </div>
            </div>
        ),
        { width: 1200, height: 630 },
    );
}
