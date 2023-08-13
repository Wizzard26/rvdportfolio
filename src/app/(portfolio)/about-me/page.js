import HeroContent from "@/components/herocontent/page";

export default function AboutMe() {
    const pageName = "AboutMe";

    return (
        <>
            <HeroContent
                className={`hero-container`}
                pageName={pageName}
                imgPos="top"
            />
            <main className="main-content">
                <div className="content-inner">
                    <h1>This is the about me page</h1>
                </div>
            </main>
        </>
    )
}