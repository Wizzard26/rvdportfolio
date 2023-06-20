import Image from "next/image";

export default function HeroContent({ imageUrl, altText}) {
    return (
        <section className="hero-container">
            <Image src={imageUrl} alt={altText} width="1920" height="902" />
        </section>
    )
}

