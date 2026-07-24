'use client';
import { useInView } from './useInView';

// Blendet Inhalt beim Hereinscrollen sanft ein – aber robust per Progressive
// Enhancement: Ohne JS (oder bei `prefers-reduced-motion`) ist der Inhalt sofort
// sichtbar. Die eigentliche Animation liegt in globals.css (.reveal); hier wird
// nur die Sichtbarkeit getriggert. Ersetzt die früheren framer-motion-Fades, die
// essenziellen Inhalt hinter `opacity:0` versteckt und damit fragil gemacht haben.
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
    const [ref, inView] = useInView();
    const mergedStyle = delay ? { ...style, transitionDelay: `${delay}s` } : style;
    return (
        <Tag
            ref={ref}
            className={`reveal${inView ? ' is-visible' : ''}${className ? ' ' + className : ''}`}
            style={mergedStyle}
            {...rest}
        >
            {children}
        </Tag>
    );
}
