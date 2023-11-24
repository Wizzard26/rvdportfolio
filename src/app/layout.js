import './globals.css'
import { kanit } from "@/app/fonts"
import Header from "@/components/header/page";
import Footer from "@/components/footer/page";
import {headers} from "next/headers";

export const metadata = {
    title: 'Portfolio of Rene van Dinter',
    description: 'Rene van Dinter Graphik and Web Designer, Web-Frontend Developer',
}

export default function RootLayout({ children }) {
    const headerList = headers();
    const pathname = headerList.get("x-invoke-path") || "";
    const specificRoute = "/dashboard";

  return (
    <html lang="de" suppressHydrationWarning>
      <body className={kanit.className}>
        {pathname !== specificRoute && <Header />}
            {children}
        {pathname !== specificRoute && <Footer />}
      </body>
    </html>
  )
}
