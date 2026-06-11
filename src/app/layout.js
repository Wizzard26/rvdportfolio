import './globals.css'
import { kanit } from "@/app/fonts"

export const metadata = {
    title: 'René van Dinter – Shopware- & Web-Developer',
    description: 'René van Dinter – Shopware- & Web-Developer mit Designhintergrund (Mediengestalter Digital und Print).',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={kanit.className}>
        {children}
      </body>
    </html>
  )
}
