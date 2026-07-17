import './globals.css'
import { kanit } from "@/app/fonts"
import { siteConfig } from "@/lib/seo"

export const metadata = {
    // Basis für alle relativen URLs in Metadaten (Canonicals, OG-Bilder).
    // Ohne metadataBase erzeugt Next relative og:image-Pfade, die LinkedIn,
    // Xing & Co. nicht auflösen können.
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.title,
        // Unterseiten setzen nur ihren eigenen Titel; der Name hängt sich an.
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.title,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    // Verhindert, dass iOS Adressen und Nummern eigenmächtig verlinkt und
    // dabei das Layout zerschießt.
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            // Volle Textlänge und großes Vorschaubild im Suchergebnis
            // erlauben — sonst kürzt Google Snippets konservativ.
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
        },
    },
}

export default function RootLayout({ children }) {
  return (
    <html lang={siteConfig.lang} suppressHydrationWarning>
      <body className={kanit.className}>
        {children}
      </body>
    </html>
  )
}
