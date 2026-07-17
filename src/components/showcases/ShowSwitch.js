'use client';
import { track } from "@/lib/analytics/track";

export default function ShowSwitch({cases, setCases}) {
    // Tab-Wechsel = Interaktion mit der Showcase (welche Referenz-Kategorie
    // angesehen wird).
    const switchTo = (key, label) => {
        setCases(key);
        track('interaction', { name: `Showcase-Tab: ${label}` });
    };

    return (
        <div className="switch-btn">
            <span className={cases === 'shopware' ? 'active btn btn--primary-full' : 'btn btn--primary'} onClick={() => switchTo('shopware', 'Shopware')}>Shopware</span>
            <span className={cases === 'react' ? 'active btn btn--primary-full' : 'btn btn--primary'} onClick={() => switchTo('react', 'NextJs / React')}>NextJs / React</span>
            <span className={cases === 'codejs' ? 'active btn btn--primary-full' : 'btn btn--primary'} onClick={() => switchTo('codejs', 'Javascript')}>Javascript</span>
            <span className={cases === 'layouts' ? 'active btn btn--primary-full' : 'btn btn--primary'} onClick={() => switchTo('layouts', 'Grafik und Webdesign')}>Grafik und Webdesign</span>
        </div>
    )
}