import {roboto_condensed} from "@/app/fonts";
import Reveal from "@/components/reveal/Reveal";

export default function ServiceBox({id, title, boxtext}) {
    return (
        <Reveal
            className="card-dark col-12 col-md-6 col-lg-6 col-xl-3"
            delay={0.1 * id}
        >
            <h3 className={`${roboto_condensed.className}`}>{title}</h3>
            <p>{boxtext} </p>
        </Reveal>
    )
}
