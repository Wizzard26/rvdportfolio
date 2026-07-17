'use client';
import { useRouter } from "next/navigation";

// Nur der Zurück-Button braucht den Router — als eigene Client-Component
// gekapselt, damit die Beitragsseite selbst eine Server-Component bleiben und
// pro Beitrag eigene Metadaten erzeugen kann.
export default function BackButton({ className }) {
    const router = useRouter();

    return (
        <button className={className} type={'button'} onClick={router.back}>
            Zurück zur Übersicht
        </button>
    )
}
