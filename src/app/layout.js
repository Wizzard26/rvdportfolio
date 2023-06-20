import './globals.css'
import { roboto } from "@/app/fonts"

export const metadata = {
  title: 'Portfolio of Rene van Dinter',
  description: 'Rene van Dinter Graphik and Web Designer, Web-Frontend Developer',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={roboto.className}>
        {children}
      </body>
    </html>
  )
}
