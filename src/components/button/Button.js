import Link from "next/link";
import {roboto_condensed} from "@/app/fonts";

export default function Button({href = '/', title = '', classname = '', style = '', text = ''} ) {
    const btnStyle = `btn--${style}`;

    return (
        <Link
            href={href}
            className={`${roboto_condensed.className} btn ${btnStyle ? btnStyle : ''} ${classname}`}
            title={title}>
            {text}
        </Link>
    )
}