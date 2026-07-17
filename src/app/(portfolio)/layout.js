import './../globals.css';
import Header from "@/components/header/page";
import Footer from "@/components/footer/page";
import JsonLd from "@/components/seo/JsonLd";
import { personSchema, webSiteSchema } from "@/lib/seo";

// Kein `metadata`-Export mehr: Titel und Beschreibung kommen aus dem
// Root-Layout (Default + Template), jede Seite überschreibt sie selbst.
// Ein Titel hier würde nur den Default duplizieren.

export default function PortfolioLayout({ children }) {
    return (
        <>
            {/*
              Person- und WebSite-Schema liegen im Layout, stehen also auf jeder
              Portfolio-Seite im HTML. Über die @id-Referenzen erkennen Google
              und LLMs alle Seiten als ein zusammenhängendes Profil derselben
              Person — statt als lose Sammlung einzelner Dokumente.
            */}
            <JsonLd data={[personSchema(), webSiteSchema()]} />
            <Header />
            {children}
            <Footer />
        </>
    )
}
