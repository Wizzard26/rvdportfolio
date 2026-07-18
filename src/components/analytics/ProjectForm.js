'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';

// Formular zum Anlegen/Bearbeiten eines Showcase-Projekts. `images` = Auswahl-
// liste vorhandener/ hochgeladener Bilder. Das Medienfeld wechselt je nach Typ.
export default function ProjectForm({ action, project, images }) {
    const [state, formAction, pending] = useActionState(action, { error: null, values: null });
    const v = state.values || project || {};
    const [mediaType, setMediaType] = useState(v.media_type || 'image');

    return (
        <form action={formAction} className="an-form an-projectform">
            {project?.id && <input type="hidden" name="id" value={project.id} />}
            <input type="hidden" name="current_media" value={project?.media || ''} />

            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            <div className="an-field-row">
                <label className="an-field">
                    <span>Kategorie</span>
                    <select name="category" defaultValue={v.category || 'shopware'}>
                        <option value="shopware">Shopware</option>
                        <option value="react">NextJs / React</option>
                        <option value="codejs">JavaScript</option>
                    </select>
                </label>
                <label className="an-field">
                    <span>Darstellung</span>
                    <select name="variant" defaultValue={v.variant || 'full'}>
                        <option value="full">Große Sektion (Case Study)</option>
                        <option value="compact">Kompakte Karte („Weitere Elemente")</option>
                    </select>
                </label>
            </div>

            <label className="an-field">
                <span>Titel *</span>
                <input name="name" defaultValue={v.name || ''} required />
            </label>

            <label className="an-field">
                <span>Untertitel (h3)</span>
                <input name="headline" defaultValue={v.headline || ''} />
            </label>

            <label className="an-field">
                <span>Beschreibung (Absätze durch Leerzeile trennen)</span>
                <textarea name="intro" rows={8} defaultValue={v.intro || ''} />
            </label>

            <label className="an-field">
                <span>Feature-Liste (ein Punkt pro Zeile)</span>
                <textarea name="features" rows={6} defaultValue={v.features || ''} />
            </label>

            <label className="an-field">
                <span>Tech-Tags (kommagetrennt)</span>
                <input name="tech" defaultValue={v.tech || ''} placeholder="Shopware 6, PHP, Vue.js" />
            </label>

            {/* Medium */}
            <label className="an-field">
                <span>Medium</span>
                <select name="media_type" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                    <option value="image">Bild</option>
                    <option value="video">Video (Pfad)</option>
                    <option value="component">Interaktive Komponente</option>
                    <option value="sandbox">Sandbox (HTML/CSS/JS)</option>
                    <option value="none">Kein Medium</option>
                </select>
            </label>

            {mediaType === 'image' && (
                <div className="an-pdf-field">
                    <label className="an-field">
                        <span>Vorhandenes Bild wählen</span>
                        <select name="image_select" defaultValue={v.media_type === 'image' ? (v.media || '') : ''}>
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
            )}

            {mediaType === 'video' && (
                <label className="an-field">
                    <span>Video-Pfad</span>
                    <input name="video_path" defaultValue={v.media_type === 'video' ? (v.media || '') : ''} placeholder="/video/dartsconnect.mp4" />
                </label>
            )}

            {mediaType === 'component' && (
                <label className="an-field">
                    <span>Interaktive Komponente</span>
                    <select name="component" defaultValue={v.media_type === 'component' ? (v.media || 'CallEvent') : 'CallEvent'}>
                        <option value="CallEvent">Calendly-Clone (CallEvent)</option>
                        <option value="WebPage">Projekt-Konfigurator (WebPage)</option>
                        <option value="Slider">Layer-Slider (Slider)</option>
                        <option value="Lottogenerator">Lotto-Generator (Lottogenerator)</option>
                        <option value="Cartsystem">Warenkorb (Cartsystem)</option>
                        <option value="Modalbox">Modalbox (Modalbox)</option>
                    </select>
                    <span className="an-card-note">Interaktive Demos sind fest im Code hinterlegt (Whitelist).</span>
                </label>
            )}

            {mediaType === 'sandbox' && (
                <div className="an-pdf-field">
                    <label className="an-field">
                        <span>Sandbox · HTML</span>
                        <textarea name="sandbox_html" rows={6} defaultValue={v.sandbox_html || ''}
                                  spellCheck={false} placeholder="<button id='btn'>Klick mich</button>" />
                    </label>
                    <label className="an-field">
                        <span>Sandbox · CSS</span>
                        <textarea name="sandbox_css" rows={6} defaultValue={v.sandbox_css || ''}
                                  spellCheck={false} placeholder="#btn { padding: 10px 16px; }" />
                    </label>
                    <label className="an-field">
                        <span>Sandbox · JavaScript</span>
                        <textarea name="sandbox_js" rows={8} defaultValue={v.sandbox_js || ''}
                                  spellCheck={false} placeholder="document.getElementById('btn').onclick = () => alert('Hallo');" />
                    </label>
                    <span className="an-card-note">Läuft isoliert in einem sandboxed iframe (kein Zugriff auf die Hauptseite). Höhe passt sich automatisch an.</span>
                </div>
            )}

            {/* Strukturierte Daten (JSON-LD) */}
            <div className="an-field-row">
                <label className="an-field">
                    <span>Schema-Typ (für Google/KI)</span>
                    <select name="schema_type" defaultValue={v.schema_type || ''}>
                        <option value="">— kein Schema —</option>
                        <option value="SoftwareApplication">SoftwareApplication (Plugin/App)</option>
                        <option value="WebApplication">WebApplication (Web-App)</option>
                    </select>
                </label>
                <label className="an-field">
                    <span>Anwendungskategorie</span>
                    <input name="application_category" defaultValue={v.application_category || ''} placeholder="BusinessApplication" />
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
                <Link href="/dashboard/showcase" className="an-btn-secondary">Abbrechen</Link>
            </div>
        </form>
    );
}
