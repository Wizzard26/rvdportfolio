import './../globals.css';
import Header from "@/components/header/page";
import Footer from "@/components/footer/page";

export const metadata = {
    title: 'René van Dinter – Shopware- & Web-Developer',
    description: 'Portfolio von René van Dinter – Shopware-6- & Web-Developer mit Designhintergrund (Mediengestalter Digital und Print).',
}

export default function PortfolioLayout({ children }) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    )
}
