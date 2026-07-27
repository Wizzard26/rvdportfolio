'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, arrayMove, useSortable, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMove, FiTrash2, FiCpu, FiUploadCloud } from 'react-icons/fi';
import {
    addProjectImagesAction, deleteProjectImageAction, toggleProjectImageAiAction, reorderProjectImagesAction,
} from '@/lib/content/showcaseImageActions';

function Row({ img, projectId }) {
    return (
        <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="an-thumb" src={img.image} alt="" width={44} height={44} />
            <div className="an-station-main">
                <div className="an-station-title">{(img.image || '').split('/').pop()}</div>
                <div className="an-station-sub">{img.ai_image ? 'Als KI-Bild markiert' : 'Echtes Bild'}</div>
            </div>
            <div className="an-station-actions">
                <form action={toggleProjectImageAiAction} className="an-inline-form">
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="ai" value={img.ai_image ? '0' : '1'} />
                    <button type="submit" className={`an-icon-btn${img.ai_image ? ' is-active' : ''}`} title={img.ai_image ? 'KI-Kennzeichnung entfernen' : 'Als KI-Bild markieren'}>
                        <FiCpu aria-hidden="true" />
                    </button>
                </form>
                <form action={deleteProjectImageAction} className="an-inline-form">
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="project_id" value={projectId} />
                    <button type="submit" className="an-icon-btn an-danger" title="Bild entfernen"><FiTrash2 /></button>
                </form>
            </div>
        </>
    );
}

function StaticItem({ img, projectId }) {
    return (
        <li className="an-station">
            <span className="an-drag-handle" title="Ziehen"><FiMove aria-hidden="true" /></span>
            <Row img={img} projectId={projectId} />
        </li>
    );
}

function SortableItem({ img, projectId }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <li ref={setNodeRef} style={style} className="an-station">
            <button type="button" className="an-drag-handle" title="Ziehen" {...attributes} {...listeners}>
                <FiMove aria-hidden="true" />
            </button>
            <Row img={img} projectId={projectId} />
        </li>
    );
}

export default function ProjectImageManager({ projectId, images = [], imageOptions = [] }) {
    const router = useRouter();
    const [list, setList] = useState(images);
    useEffect(() => { setList(images); }, [images]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [state, formAction, pending] = useActionState(addProjectImagesAction, {});
    // Nach erfolgreichem Hinzufügen die Serverdaten neu laden (Liste aktualisieren).
    useEffect(() => { if (state?.ok) router.refresh(); }, [state, router]);

    const [, startTransition] = useTransition();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = list.findIndex((i) => i.id === active.id);
        const newIndex = list.findIndex((i) => i.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(list, oldIndex, newIndex);
        setList(next);
        startTransition(() => reorderProjectImagesAction(projectId, next.map((i) => i.id)));
    };

    return (
        <div>
            {/* Hinzufügen: mehrere Dateien auf einmal + optional vorhandenes Bild */}
            <form action={formAction} className="an-form" style={{ marginBottom: 22 }}>
                <input type="hidden" name="project_id" value={projectId} />
                <div className="an-field-row">
                    <label className="an-field">
                        <span>Bilder hochladen (Mehrfachauswahl möglich)</span>
                        <input type="file" name="images" multiple accept="image/png,image/jpeg,image/webp,image/gif" />
                    </label>
                    {imageOptions.length > 0 && (
                        <label className="an-field">
                            <span>oder ein vorhandenes Bild hinzufügen</span>
                            <select name="image_select" defaultValue="">
                                <option value="">— keins —</option>
                                {imageOptions.map((im) => (
                                    <option key={im.link} value={im.link}>{im.label}{im.source === 'upload' ? ' (hochgeladen)' : ''}</option>
                                ))}
                            </select>
                        </label>
                    )}
                </div>
                <label className="an-check">
                    <input type="checkbox" name="ai_image" />
                    <span>diese Bilder als KI-Bild markieren (sonst wird KI automatisch aus den Metadaten erkannt)</span>
                </label>
                <button type="submit" className="an-btn-primary" disabled={pending}>
                    <FiUploadCloud aria-hidden="true" /> {pending ? 'Wird hinzugefügt…' : 'Bilder hinzufügen'}
                </button>
                {state?.error && <p className="an-form-error">{state.error}</p>}
            </form>

            {/* Liste + Drag-Sortierung */}
            {list.length === 0 ? (
                <p className="an-empty">Noch keine Bilder. Oben hochladen — das erste Bild ist das Hero-Bild.</p>
            ) : !mounted ? (
                <ul className="an-stationlist">
                    {list.map((img) => <StaticItem key={img.id} img={img} projectId={projectId} />)}
                </ul>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={list.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        <ul className="an-stationlist">
                            {list.map((img) => <SortableItem key={img.id} img={img} projectId={projectId} />)}
                        </ul>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
