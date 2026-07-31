import './../globals.css';
import Header from "@/components/header/page";
import Footer from "@/components/footer/page";
import JsonLd from "@/components/seo/JsonLd";
import Tracker from "@/components/analytics/Tracker";
import AssistantWidget from "@/components/assistant/AssistantWidget";
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
            {/* Erster Fokus-Stopp für Tastatur/Screenreader: überspringt Header/Nav. */}
            <a href="#maincontent" className="skip-link">Zum Inhalt springen</a>
            <JsonLd data={[personSchema(), webSiteSchema()]} />
            {/* Cookiefreier First-Party-Tracker — nur auf öffentlichen Seiten. */}
            <Tracker />
            {/* Flex-Spalte über die volle Höhe → der Footer sitzt auch bei wenig
                Inhalt unten am Viewport (Sticky-Footer). */}
            <div className="site-shell">
                <Header />
                {/* Sprungziel des Skip-Links (Beginn des Hauptinhalts). */}
                <a id="maincontent" tabIndex={-1} className="skip-anchor" aria-hidden="true" />
                {children}
                <Footer />
            </div>
            {/* CV-Assistent (grounded, ohne externe API) — nur öffentliche Seiten. */}
            <AssistantWidget />
        </>
    )
}
