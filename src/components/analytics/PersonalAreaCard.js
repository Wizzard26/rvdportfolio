'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import {
    SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMove, FiEdit2, FiTrash2, FiPlus, FiFile, FiX, FiCheck } from 'react-icons/fi';
import {
    updateAreaAction, deleteAreaAction,
    createEntryAction, updateEntryAction, deleteEntryAction,
} from '@/lib/content/vitaPersonalActions';

// Diese Karte rendert nur (Drag-Koordination läuft über den EINEN DndContext im
// VitaPersonalManager). Sortierbare IDs sind namespaced: `area-<id>`/`entry-<id>`.

// PDF-Feld: Auswahl aus vorhandenen Dokumenten + optionaler Upload.
function PdfField({ documents, currentLink }) {
    return (
        <div className="an-pdf-field">
            <label className="an-field">
                <span>PDF verknüpfen (optional)</span>
                <select name="link" defaultValue={currentLink || ''}>
                    <option value="">— kein Link —</option>
                    {documents.map((d) => (
                        <option key={d.link} value={d.link}>
                            {d.label}{d.source === 'upload' ? ' (hochgeladen)' : ''}
                        </option>
                    ))}
                    {currentLink && !documents.some((d) => d.link === currentLink) && (
                        <option value={currentLink}>{currentLink}</option>
                    )}
                </select>
            </label>
            <label className="an-field">
                <span>oder neue PDF hochladen (überschreibt die Auswahl)</span>
                <input type="file" name="pdf" accept="application/pdf" />
            </label>
        </div>
    );
}

// Formular für Eintrag anlegen ODER bearbeiten.
function EntryForm({ action, entry, areaId, documents, onDone }) {
    const [state, formAction, pending] = useActionState(action, { ok: false });

    useEffect(() => {
        if (state?.ok && onDone) onDone();
    }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <form action={formAction} className="an-entryform">
            {entry?.id && <input type="hidden" name="id" value={entry.id} />}
            {areaId && <input type="hidden" name="area_id" value={areaId} />}

            {state?.error && <p className="an-form-error">{state.error}</p>}

            <label className="an-field">
                <span>Text *</span>
                <input name="text" defaultValue={entry?.text || ''} required />
            </label>

            <PdfField documents={documents} currentLink={entry?.link} />

            <div className="an-form-actions">
                <button type="submit" className="an-btn-primary" disabled={pending}>
                    {pending ? 'Speichern …' : (entry ? 'Speichern' : 'Hinzufügen')}
                </button>
                {onDone && entry && (
                    <button type="button" className="an-btn-secondary" onClick={onDone}>Abbrechen</button>
                )}
            </div>
        </form>
    );
}

// Eine sortierbare Eintragszeile.
function SortableEntry({ entry, documents }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `entry-${entry.id}` });
    const [editing, setEditing] = useState(false);
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

    return (
        <li ref={setNodeRef} style={style} className="an-entry">
            <button type="button" className="an-drag-handle an-drag-sm" title="Ziehen" {...attributes} {...listeners}>
                <FiMove aria-hidden="true" />
            </button>

            {editing ? (
                <div className="an-entry-edit">
                    <EntryForm action={updateEntryAction} entry={entry} documents={documents} onDone={() => setEditing(false)} />
                </div>
            ) : (
                <>
                    <span className="an-entry-text">
                        {entry.text}
                        {entry.link && <span className="an-entry-pdf" title={entry.link}><FiFile aria-hidden="true" /> PDF</span>}
                    </span>
                    <span className="an-station-actions">
                        <button type="button" className="an-icon-btn" title="Bearbeiten" onClick={() => setEditing(true)}><FiEdit2 /></button>
                        <form action={deleteEntryAction} className="an-inline-form">
                            <input type="hidden" name="id" value={entry.id} />
                            <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button>
                        </form>
                    </span>
                </>
            )}
        </li>
    );
}

// Bereichskopf im Bearbeiten-Modus.
function AreaEditForm({ area, onDone }) {
    const [state, action, pending] = useActionState(updateAreaAction, { ok: false });
    useEffect(() => { if (state?.ok && onDone) onDone(); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
    return (
        <form action={action} className="an-areaedit">
            <input type="hidden" name="id" value={area.id} />
            <input name="title" defaultValue={area.title || ''} placeholder="Überschrift" className="an-newarea-input" />
            <label className="an-check">
                <input type="checkbox" name="show_headline" defaultChecked={!!area.show_headline} /> Überschrift anzeigen
            </label>
            <button type="submit" className="an-icon-btn" title="Speichern" disabled={pending}><FiCheck /></button>
            <button type="button" className="an-icon-btn" title="Abbrechen" onClick={onDone}><FiX /></button>
        </form>
    );
}

export default function PersonalAreaCard({ area, documents }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `area-${area.id}` });
    const [editingArea, setEditingArea] = useState(false);
    const entries = area.entries;

    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1, zIndex: isDragging ? 2 : undefined };

    return (
        <div ref={setNodeRef} style={style} className="an-area">
            <div className="an-area-head">
                <button type="button" className="an-drag-handle" title="Bereich ziehen" {...attributes} {...listeners}>
                    <FiMove aria-hidden="true" />
                </button>

                {editingArea ? (
                    <AreaEditForm area={area} onDone={() => setEditingArea(false)} />
                ) : (
                    <>
                        <div className="an-area-title">
                            {area.title || <em className="an-muted">(ohne Überschrift)</em>}
                            {!area.show_headline && <span className="an-badge" title="Überschrift wird auf der Seite nicht angezeigt">Überschrift aus</span>}
                        </div>
                        <div className="an-station-actions">
                            <button type="button" className="an-icon-btn" title="Bereich bearbeiten" onClick={() => setEditingArea(true)}><FiEdit2 /></button>
                            <form action={deleteAreaAction} className="an-inline-form">
                                <input type="hidden" name="id" value={area.id} />
                                <button type="submit" className="an-icon-btn an-danger" title="Bereich löschen"><FiTrash2 /></button>
                            </form>
                        </div>
                    </>
                )}
            </div>

            {/* Einträge — sortierbar im selben DndContext wie die Bereiche */}
            {entries.length > 0 && (
                <SortableContext items={entries.map((e) => `entry-${e.id}`)} strategy={verticalListSortingStrategy}>
                    <ul className="an-entrylist">
                        {entries.map((entry) => (
                            <SortableEntry key={entry.id} entry={entry} documents={documents} />
                        ))}
                    </ul>
                </SortableContext>
            )}

            {/* Eintrag hinzufügen */}
            <details className="an-addentry">
                <summary><FiPlus aria-hidden="true" /> Eintrag hinzufügen</summary>
                <EntryForm action={createEntryAction} areaId={area.id} documents={documents} onDone={null} />
            </details>
        </div>
    );
}
