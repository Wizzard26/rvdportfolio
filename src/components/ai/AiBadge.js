import { FiCpu } from 'react-icons/fi';
import styles from './aiBadge.module.css';

// Kennzeichnung „KI-Bild" (oben links auf dem Bild). Bezieht sich bewusst NUR
// auf das Bild, nicht auf den umgebenden Text/Beitrag — analog zu LinkedIn/Meta.
// Der umgebende Container muss `position: relative` sein.
export default function AiBadge({ label = 'KI-Bild' }) {
    return (
        <span className={styles.badge} title="Dieses Bild wurde mit KI erstellt">
            <FiCpu aria-hidden="true" />
            <span>{label}</span>
        </span>
    );
}
