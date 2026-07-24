import {ranga} from "@/app/fonts";
import Button from "@/components/button/Button";
import Reveal from "@/components/reveal/Reveal";

export default function ContactBox({id, name, boxtext, link, linktitle, linktext, style}) {
    return (
        <Reveal className="card-light col-12 col-md-6" delay={0.1 * id}>
            <h3 className={`${ranga.className}`}>{name}</h3>
            <p>
                {boxtext}
            </p>
            <Button
                href={link}
                title={linktitle}
                style={style}
                text={linktext}
            />
        </Reveal>
    )
}
