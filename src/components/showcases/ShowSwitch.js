'use client';
export default function ShowSwitch({cases, setCases}) {
    return (
        <div className="switch-btn">
            <span className={cases === 'layouts' ? 'active btn btn--primary-full' : 'btn btn--primary'} onClick={() => setCases('layouts')}>Grafik und Webdesign</span>
            <span className={cases === 'codejs' ? 'active btn btn--primary-full' : 'btn btn--primary'} onClick={() => setCases('codejs')}>Javascript Demos</span>
            <span className={cases === 'react' ? 'active btn btn--primary-full' : 'btn btn--primary'} onClick={() => setCases('react')}>NextJs / React</span>
            <span className={cases === 'shopware5' ? 'active btn btn--primary-full' : 'btn btn--primary'} onClick={() => setCases('shopware5')}>Shopware 5</span>
            <span className={cases === 'shopware6' ? 'active btn btn--primary-full' : 'btn btn--primary'} onClick={() => setCases('shopware6')}>Shopware 6</span>
        </div>
    )
}