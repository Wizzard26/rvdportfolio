'use client';
export default function ShowSwitch({cases, setCases}) {
    return (
        <div className="switch-btn">
            <span className={cases === 'layouts' ? 'active btn btn--primary-full' : 'btn btn--primary'} onClick={() => setCases('layouts')}>Grafik und Webdesign</span>
            <span className={cases === 'codejs' ? 'active btn btn--primary-full' : 'btn btn--primary'} onClick={() => setCases('codejs')}>Javascript Demos</span>
        </div>
    )
}