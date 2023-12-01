import Link from "next/link";
import {roboto_condensed} from "@/app/fonts";

export default function Button({href = '/', title = '', classname = '', style = '', text = '', isDownload = false} ) {
    const btnStyle = `btn--${style}`;

    return (
        <>
            {isDownload
                ? <a
                    href={href}
                    className={`${roboto_condensed.className} btn ${btnStyle ? btnStyle : ''} ${classname}`}
                    title={title}
                    download={title}
                >
                    {text}
                </a>
                : <Link
                    href={href}
                    className={`${roboto_condensed.className} btn ${btnStyle ? btnStyle : ''} ${classname}`}
                    title={title}>
                    {text}
                </Link>
            }
        </>
    )
}