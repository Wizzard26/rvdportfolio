import './../globals.css';
import Header from "@/components/header/page";
import Footer from "@/components/footer/page";
import HeroContent from "@/components/herocontent/page";

export const metadata = {
    title: 'Rene van Dinter Portfolio',
    description: 'This is my little portfolio. Iam a Web Frontend Developer and Graphik Designer',
}

export default function DashboardLayout({ children }) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>

    )
}