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
import { FiMove, FiTrash2, FiCpu, FiUploadCloud, FiEdit2 } from 'react-icons/fi';
import {
    addRefImagesAction, updateRefImageAction, deleteRefImageAction,
    toggleRefImageAiAction, reorderRefImagesAction,
} from '@/lib/content/privateRefsActions';

// Bearbeiten-Panel: KI-Flag setzen und/oder Screenshot ersetzen.
function EditPanel({ img, refId, onClose }) {
    const router = useRouter();
    const [state, formAction, pending] = useActionState(updateRefImageAction, {});
    useEffect(() => { if (state?.ok) { router.refresh(); onClose(); } }, [state, router, onClose]);

    return (
        <form action={formAction} className="an-imgeditor">
            <input type="hidden" name="id" value={img.id} />
            <input type="hidden" name="ref_id" value={refId} />
            <label className="an-field"><span>Screenshot ersetzen (Upload)</span>
                <input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" /></label>
            <label className="an-check">
                <input type="checkbox" name="ai_image" defaultChecked={!!img.ai_image} />
                <span>KI-Inhalt (Badge „KI-Bild")</span>
            </label>
            {state?.error && <p className="an-form-error">{state.error}</p>}
            <div className="an-form-actions">
                <button type="submit" className="an-btn-primary an-btn-small" disabled={pending}>{pending ? 'Speichern…' : 'Speichern'}</button>
                <button type="button" className="an-btn-secondary an-btn-small" onClick={onClose}>Abbrechen</button>
            </div>
        </form>
    );
}

function RowInner({ img, refId, editing, onToggleEdit }) {
    const title = (img.image || '').split('/').pop();
    return (
        <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="an-thumb" src={img.image} alt="" width={44} height={44} />
            <div className="an-station-main">
                <div className="an-station-title">{title}</div>
                <div className="an-station-sub">{img.ai_image ? 'KI-Bild' : 'Screenshot'}</div>
            </div>
            <div className="an-station-actions">
                <form action={toggleRefImageAiAction} className="an-inline-form">
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="ref_id" value={refId} />
                    <input type="hidden" name="ai" value={img.ai_image ? '0' : '1'} />
                    <button type="submit" className={`an-icon-btn${img.ai_image ? ' is-active' : ''}`} title={img.ai_image ? 'KI-Kennzeichnung entfernen' : 'Als KI-Inhalt markieren'}>
                        <FiCpu aria-hidden="true" />
                    </button>
                </form>
                <button type="button" className={`an-icon-btn${editing ? ' is-active' : ''}`} title="Bearbeiten" onClick={onToggleEdit}>
                    <FiEdit2 aria-hidden="true" />
                </button>
                <form action={deleteRefImageAction} className="an-inline-form">
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="ref_id" value={refId} />
                    <button type="submit" className="an-icon-btn an-danger" title="Entfernen"><FiTrash2 /></button>
                </form>
            </div>
        </>
    );
}

function ImageItem({ img, refId, handle, dragRef, dragStyle }) {
    const [editing, setEditing] = useState(false);
    return (
        <li ref={dragRef} style={dragStyle} className="an-imgitem">
            <div className="an-station">
                {handle}
                <RowInner img={img} refId={refId} editing={editing} onToggleEdit={() => setEditing((e) => !e)} />
            </div>
            {editing && <EditPanel img={img} refId={refId} onClose={() => setEditing(false)} />}
        </li>
    );
}

function StaticItem(props) {
    return <ImageItem {...props} handle={<span className="an-drag-handle" title="Ziehen"><FiMove aria-hidden="true" /></span>} />;
}

function SortableItem(props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.img.id });
    const dragStyle = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <ImageItem
            {...props}
            dragRef={setNodeRef}
            dragStyle={dragStyle}
            handle={<button type="button" className="an-drag-handle" title="Ziehen" {...attributes} {...listeners}><FiMove aria-hidden="true" /></button>}
        />
    );
}

export default function PrivateRefImageManager({ refId, images = [] }) {
    const router = useRouter();
    const [list, setList] = useState(images);
    useEffect(() => { setList(images); }, [images]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [imgState, imgAction, imgPending] = useActionState(addRefImagesAction, {});
    useEffect(() => { if (imgState?.ok) router.refresh(); }, [imgState, router]);

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
        startTransition(() => reorderRefImagesAction(refId, next.map((i) => i.id)));
    };

    return (
        <div>
            <form action={imgAction} className="an-form" style={{ marginBottom: 16 }}>
                <input type="hidden" name="ref_id" value={refId} />
                <label className="an-field">
                    <span>Screenshots hochladen (Mehrfachauswahl möglich)</span>
                    <input type="file" name="images" multiple accept="image/png,image/jpeg,image/webp,image/gif" />
                </label>
                <label className="an-check">
                    <input type="checkbox" name="ai_image" />
                    <span>diese Bilder als KI-Bild markieren (sonst wird KI automatisch aus den Metadaten erkannt)</span>
                </label>
                <button type="submit" className="an-btn-primary" disabled={imgPending}>
                    <FiUploadCloud aria-hidden="true" /> {imgPending ? 'Wird hinzugefügt…' : 'Screenshots hinzufügen'}
                </button>
                {imgState?.error && <p className="an-form-error">{imgState.error}</p>}
            </form>

            {list.length === 0 ? (
                <p className="an-empty">Noch keine Screenshots. Oben hinzufügen – das erste Bild ist das Titelbild.</p>
            ) : !mounted ? (
                <ul className="an-stationlist">
                    {list.map((img) => <StaticItem key={img.id} img={img} refId={refId} />)}
                </ul>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={list.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        <ul className="an-stationlist">
                            {list.map((img) => <SortableItem key={img.id} img={img} refId={refId} />)}
                        </ul>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
