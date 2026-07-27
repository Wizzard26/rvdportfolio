'use client';

import { useState } from 'react';
import ProjectForm from './ProjectForm';
import ProjectImageManager from './ProjectImageManager';

// Client-Wrapper: hält den Media-Typ und zeigt bei „Galerie"/„Slider" SOFORT den
// Bild-Manager (kein Speichern-Reload nötig). Formular und Manager liegen als
// Geschwister nebeneinander — nicht verschachtelt, weil <form> in <form> in
// HTML ungültig ist und die Upload-/Sortier-Formulare des Managers sonst brächen.
export default function ProjectEditor({ action, project, images }) {
    const [mediaType, setMediaType] = useState(project?.media_type || 'image');
    const showManager = mediaType === 'gallery' || mediaType === 'slider';

    return (
        <>
            <section className="an-card an-card-form an-card-wide">
                <ProjectForm
                    action={action}
                    project={project}
                    images={images}
                    mediaType={mediaType}
                    onMediaType={setMediaType}
                />
            </section>

            {showManager && (
                <section className="an-card an-card-wide">
                    <h2>Projekt-Bilder</h2>
                    {project?.id ? (
                        <>
                            <p className="an-card-note">
                                Das erste Bild ist das Hero-Bild. Reihenfolge per Drag &amp; Drop; das Prozessor-Symbol
                                je Bild schaltet die KI-Kennzeichnung um. Uploads werden sofort gespeichert.
                            </p>
                            <ProjectImageManager projectId={project.id} images={project.images || []} imageOptions={images} />
                        </>
                    ) : (
                        <p className="an-card-note">
                            Neues Projekt: Speichere es einmal (Titel genügt) — du bleibst auf dieser Seite und kannst
                            danach hier direkt Bilder hochladen, sortieren und je Bild kennzeichnen.
                        </p>
                    )}
                </section>
            )}
        </>
    );
}
