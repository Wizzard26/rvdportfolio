import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/seo';

// Erzeugt das Vorschaubild für Social-Media-Shares (LinkedIn, Xing, Slack,
// WhatsApp, X). Liegt im app-Root und wird dadurch von allen Seiten geerbt.
//
// Bewusst generiert statt als PNG gepflegt: Der Inhalt bleibt automatisch mit
// `siteConfig` synchron und es gibt kein Bild-Asset, das inhaltlich veraltet.
//
// Ohne Font-Angabe nutzt ImageResponse die mitgelieferte Schrift. Die
// Hausschriften liegen nur als .woff2 vor — das Format kann der Renderer
// (Satori) nicht lesen, deshalb hier keine eigene Einbindung.

export const alt = `${siteConfig.title} – Portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Farben aus globals.css (Light-Theme), damit das Bild zur Seite passt.
const colors = {
    primary: 'rgb(63, 104, 126)',
    primaryDark: 'rgb(55, 85, 103)',
    secondary: 'rgb(198, 62, 86)',
    light: 'rgb(250, 250, 250)',
};

export default function OpengraphImage() {
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
                        color: colors.light,
                        opacity: 0.75,
                    }}
                >
                    Portfolio
                </div>

                <div
                    style={{
                        fontSize: 82,
                        fontWeight: 700,
                        marginTop: 12,
                        lineHeight: 1.1,
                    }}
                >
                    René van Dinter
                </div>

                {/* Akzentlinie in der Sekundärfarbe — das Wiedererkennungsmerkmal der Seite. */}
                <div
                    style={{
                        width: 180,
                        height: 10,
                        background: colors.secondary,
                        margin: '32px 0',
                        borderRadius: 5,
                    }}
                />

                <div style={{ fontSize: 46, lineHeight: 1.25 }}>
                    Shopware- &amp; Web-Developer
                </div>
                <div style={{ fontSize: 30, marginTop: 14, opacity: 0.85, lineHeight: 1.4 }}>
                    Shopware 6 · React &amp; Next.js · PHP/Symfony
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: 'auto',
                        fontSize: 26,
                        opacity: 0.8,
                    }}
                >
                    <div>Entwickler mit Designhintergrund</div>
                    <div>rene-van-dinter.de</div>
                </div>
            </div>
        ),
        size,
    );
}
