'use client';
import Link from "next/link";
import {roboto_condensed} from "@/app/fonts";
import { track } from "@/lib/analytics/track";

// 'use client' nur wegen des CTA-Trackings beim Klick — Darstellung und Props
// bleiben unverändert. Das Label für die Auswertung kommt aus `text`/`title`.
export default function Button({href = '/', title = '', classname = '', style = '', text = '', isDownload = false} ) {
    const btnStyle = `btn--${style}`;
    const label = text || title || href;

    const handleClick = () => {
        track('cta', { name: label, meta: { href, download: isDownload } });
    };

    return (
        <>
            {isDownload
                ? <a
                    href={href}
                    className={`${roboto_condensed.className} btn ${btnStyle ? btnStyle : ''} ${classname}`}
                    title={title}
                    download={title}
                    onClick={handleClick}
                >
                    {text}
                </a>
                : <Link
                    href={href}
                    className={`${roboto_condensed.className} btn ${btnStyle ? btnStyle : ''} ${classname}`}
                    title={title}
                    onClick={handleClick}>
                    {text}
                </Link>
            }
        </>
    )
}
