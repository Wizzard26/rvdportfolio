import Link from "next/link";
import {roboto} from "@/app/fonts";

export default function ContactData() {
    return (
        <>
            <h2 className={roboto.className}>Verantworlicher</h2>
            <p>René van Dinter<br />
            Schiffertorsstrasse 22<br />
            21682 Stade</p>
            <p>E-Mail: <Link href={'mailto:info@rene-van-dinter.de'}>info@rene-van-dinter.de</Link><br />
                Tel.: <Link href={'tel:+491749327538'}>0174 / 93 27 538</Link></p>
        </>
    )
}