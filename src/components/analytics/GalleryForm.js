'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';

// Formular zum Anlegen/Bearbeiten eines Galerie-Elements. `images` = Auswahlliste
// vorhandener/hochgeladener Bilder. Für Logo/Print zählt nur Titel + Bild.
export default function GalleryForm({ action, item, images }) {
    const [state, formAction, pending] = useActionState(action, { error: null, values: null });
    const v = state.values || item || {};
    const [gallery, setGallery] = useState(v.gallery || 'ecommerce');
    const isLayout = gallery === 'ecommerce' || gallery === 'website';

    return (
        <form action={formAction} className="an-form an-projectform">
            {item?.id && <input type="hidden" name="id" value={item.id} />}
            <input type="hidden" name="current_image" value={item?.image || ''} />

            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            <label className="an-field">
                <span>Galerie</span>
                <select name="gallery" value={gallery} onChange={(e) => setGallery(e.target.value)}>
                    <option value="ecommerce">E-Commerce Layout</option>
                    <option value="website">Web Layout</option>
                    <option value="logo">Logo Design</option>
                    <option value="print">Print Design</option>
                </select>
            </label>

            <label className="an-field">
                <span>Titel *{!isLayout && ' (Alt-Text)'}</span>
                <input name="title" defaultValue={v.title || ''} required />
            </label>

            {isLayout && (
                <>
                    <label className="an-field">
                        <span>Beschreibung</span>
                        <textarea name="description" rows={4} defaultValue={v.description || ''} />
                    </label>
                    <label className="an-field">
                        <span>Technik (ein Tag, z. B. „Shopware")</span>
                        <input name="technik" defaultValue={v.technik || ''} placeholder="Shopware" />
                    </label>
                </>
            )}

            <div className="an-pdf-field">
                <label className="an-field">
                    <span>Vorhandenes Bild wählen</span>
                    <select name="image_select" defaultValue={item?.image || ''}>
                        <option value="">— keins / behalten —</option>
                        {images.map((im) => (
                            <option key={im.link} value={im.link}>{im.label}{im.source === 'upload' ? ' (hochgeladen)' : ''}</option>
                        ))}
                    </select>
                </label>
                <label className="an-field">
                    <span>oder neues Bild hochladen (überschreibt die Auswahl)</span>
                    <input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" />
                </label>
            </div>

            <label className="an-check">
                <input type="checkbox" name="is_active" defaultChecked={!!v.is_active} />
                <span>Aktiv – öffentlich sichtbar (ohne Haken: Entwurf)</span>
            </label>

            <div className="an-form-actions">
                <button type="submit" className="an-btn-primary" disabled={pending}>
                    {pending ? 'Speichern …' : 'Speichern'}
                </button>
                <Link href="/dashboard/showcase/galerien" className="an-btn-secondary">Abbrechen</Link>
            </div>
        </form>
    );
}
