import HeroContent from "@/components/herocontent/page";
import Teaser from "@/components/teaser/page";
import Blockqoutes from "@/components/blockqoutes/page";

export default function AboutMe() {
    const pageName = "AboutMe";

    return (
        <>
            <HeroContent
                className={`hero-container`}
                pageName={pageName}
                imgPos="top"
            />
            <Teaser
                className="main--teaser"
                pageName={pageName}
            />
            <Blockqoutes />
        </>
    )
}