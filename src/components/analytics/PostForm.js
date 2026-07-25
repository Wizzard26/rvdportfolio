'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import MarkdownEditor from '@/components/analytics/MarkdownEditor';
import { toIsoDate } from '@/lib/dateFormat';

// Formular zum Anlegen/Bearbeiten eines Beitrags (Blog oder Doku).
// `categories` = admin-verwaltete Auswahlliste (aus content.db), `docParents` =
// vorhandene Doku-Seiten für die Eltern-Auswahl (Seitenbaum).
export default function PostForm({ action, post, images = [], categories = [], docParents = [], spaces = [] }) {
    const [state, formAction, pending] = useActionState(action, { error: null, values: null });
    const v = state.values || post || {};
    const [type, setType] = useState(v.type || 'blog');
    const activeCats = new Set(v.categoryList || (v.category ? v.category.split(',').map((c) => c.trim()) : []));

    return (
        <form action={formAction} className="an-form">
            {post?.id && <input type="hidden" name="id" value={post.id} />}
            <input type="hidden" name="current_image" value={post?.image || ''} />

            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            <div className="an-field-row">
                <label className="an-field">
                    <span>Typ</span>
                    <select name="type" value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="blog">Blog-Beitrag</option>
                        <option value="doc">Doku-Seite</option>
                    </select>
                </label>
                <label className="an-field">
                    <span>Slug (URL, leer = aus Titel)</span>
                    <input name="slug" defaultValue={v.slug || ''} placeholder="mein-beitrag" />
                </label>
            </div>

            <label className="an-field">
                <span>Titel *</span>
                <input name="title" defaultValue={v.title || ''} required />
            </label>

            <label className="an-field">
                <span>Untertitel</span>
                <input name="subline" defaultValue={v.subline || ''} />
            </label>

            <label className="an-field">
                <span>Teaser (Kurzbeschreibung für Übersicht &amp; Meta-Description)</span>
                <textarea name="teaser" rows={3} defaultValue={v.teaser || ''} />
            </label>

            {type === 'blog' && (
                <>
                    <fieldset className="an-field">
                        <span>Kategorien</span>
                        {categories.length === 0 ? (
                            <span className="an-card-note">
                                Noch keine Kategorien — im Tab „Kategorien" anlegen.
                            </span>
                        ) : (
                            <div className="an-checkgrid">
                                {categories.map((cat) => (
                                    <label className="an-check" key={cat.id}>
                                        <input
                                            type="checkbox"
                                            name="category"
                                            value={cat.name}
                                            defaultChecked={activeCats.has(cat.name)}
                                        />
                                        <span>{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </fieldset>

                    <div className="an-field-row">
                        <label className="an-field">
                            <span>Autor</span>
                            <input name="author" defaultValue={v.author || 'René van Dinter'} />
                        </label>
                        <label className="an-field">
                            <span>Veröffentlicht am</span>
                            <input type="date" name="published_at" defaultValue={toIsoDate(v.published_at)} />
                        </label>
                    </div>
                </>
            )}

            {type === 'doc' && (
                <>
                    <label className="an-field">
                        <span>Doku-Bereich *</span>
                        <select name="space_id" defaultValue={v.space_id || (spaces[0]?.id ?? '')}>
                            {spaces.length === 0 && <option value="">— erst einen Bereich anlegen —</option>}
                            {spaces.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <span className="an-card-note">In welche eigenständige Doku gehört diese Seite (öffentlich unter /docs/&lt;bereich&gt;).</span>
                    </label>
                    <div className="an-field-row">
                        <label className="an-field">
                            <span>Gruppe (Sidebar-Abschnitt)</span>
                            <input name="doc_group" defaultValue={v.doc_group || ''} placeholder="Einstieg" />
                        </label>
                        <label className="an-field">
                            <span>Übergeordnete Seite (im selben Bereich)</span>
                            <select name="parent_id" defaultValue={v.parent_id || 0}>
                                <option value={0}>— keine (oberste Ebene) —</option>
                                {docParents.filter((d) => d.id !== post?.id).map((d) => (
                                    <option key={d.id} value={d.id}>{d.title}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </>
            )}

            {/* Beitragsbild */}
            <div className="an-pdf-field">
                <label className="an-field">
                    <span>Bild wählen</span>
                    <select name="image_select" defaultValue={post?.image || ''}>
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
                <input type="checkbox" name="ai_image" defaultChecked={!!v.ai_image} />
                <span>Beitragsbild mit KI erstellt – zeigt einen „KI-Bild"-Badge (bei Bild-Upload mit KI-Metadaten automatisch gesetzt)</span>
            </label>

            <label className="an-field">
                <span>Inhalt (Markdown)</span>
                <MarkdownEditor name="body" defaultValue={v.body || ''} />
            </label>

            <label className="an-check">
                <input type="checkbox" name="is_active" defaultChecked={!!v.is_active} />
                <span>Aktiv – öffentlich sichtbar (ohne Haken: Entwurf)</span>
            </label>

            <div className="an-form-actions">
                <button type="submit" className="an-btn-primary" disabled={pending}>
                    {pending ? 'Speichern …' : 'Speichern'}
                </button>
                <Link href={type === 'doc' ? '/dashboard/blog/docs' : '/dashboard/blog'} className="an-btn-secondary">Abbrechen</Link>
            </div>
        </form>
    );
}
