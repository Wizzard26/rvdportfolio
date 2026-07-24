'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import {
    DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, arrayMove, useSortable, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMove, FiTrash2, FiPlus, FiFileText } from 'react-icons/fi';
import {
    createSpaceAction, deleteSpaceAction, reorderSpacesAction, toggleSpaceAction,
} from '@/lib/content/docSpacesActions';

function SpaceRow({ space }) {
    return (
        <>
            <div className="an-station-main">
                <div className="an-station-title">
                    <Link href={`/dashboard/blog/docs/${space.id}`}>{space.name}</Link>
                    <span className="an-badge">{space.pages} {space.pages === 1 ? 'Seite' : 'Seiten'}</span>
                </div>
                <div className="an-station-sub">
                    <span className="an-muted">/docs/{space.slug}</span>
                    {space.description && <span> · {space.description}</span>}
                </div>
            </div>
            <div className="an-station-actions">
                <form action={toggleSpaceAction} className="an-inline-form">
                    <input type="hidden" name="id" value={space.id} />
                    <input type="hidden" name="active" value={space.is_active ? '0' : '1'} />
                    <button type="submit" className={`an-status ${space.is_active ? 'is-active' : 'is-draft'}`}
                        title={space.is_active ? 'Aktiv – klicken für Entwurf' : 'Entwurf – klicken zum Aktivieren'}>
                        {space.is_active ? 'Aktiv' : 'Entwurf'}
                    </button>
                </form>
                <Link href={`/dashboard/blog/docs/${space.id}`} className="an-icon-btn" title="Seiten verwalten"><FiFileText /></Link>
                <form action={deleteSpaceAction} className="an-inline-form"
                    onSubmit={(e) => { if (!confirm('Bereich inkl. aller Seiten löschen?')) e.preventDefault(); }}>
                    <input type="hidden" name="id" value={space.id} />
                    <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button>
                </form>
            </div>
        </>
    );
}

function StaticSpace({ space }) {
    return (
        <li className="an-station">
            <span className="an-drag-handle" title="Ziehen"><FiMove aria-hidden="true" /></span>
            <SpaceRow space={space} />
        </li>
    );
}

function SortableSpace({ space }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: space.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <li ref={setNodeRef} style={style} className="an-station">
            <button type="button" className="an-drag-handle" title="Ziehen" {...attributes} {...listeners}>
                <FiMove aria-hidden="true" />
            </button>
            <SpaceRow space={space} />
        </li>
    );
}

export default function SpaceManager({ spaces }) {
    const [items, setItems] = useState(spaces);
    useEffect(() => { setItems(spaces); }, [spaces]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const formRef = useRef(null);
    const [state, formAction, pending] = useActionState(createSpaceAction, { error: null });
    useEffect(() => { if (state.ok) formRef.current?.reset(); }, [state]);

    const [, startTransition] = useTransition();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((s) => s.id === active.id);
        const newIndex = items.findIndex((s) => s.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(items, oldIndex, newIndex);
        setItems(next);
        startTransition(() => reorderSpacesAction(next.map((s) => s.id)));
    };

    return (
        <div>
            <form ref={formRef} action={formAction} className="an-inline-add an-inline-add-space">
                <input name="name" placeholder="Neuer Doku-Bereich (z. B. Plugin Doku) …" aria-label="Name" required />
                <input name="description" placeholder="Kurzbeschreibung (optional)" aria-label="Beschreibung" />
                <button type="submit" className="an-btn-primary" disabled={pending}>
                    <FiPlus aria-hidden="true" /> Anlegen
                </button>
            </form>
            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            {items.length === 0 ? (
                <p className="an-empty">Noch keine Doku-Bereiche.</p>
            ) : !mounted ? (
                <ul className="an-stationlist">{items.map((s) => <StaticSpace key={s.id} space={s} />)}</ul>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                        <ul className="an-stationlist">{items.map((s) => <SortableSpace key={s.id} space={s} />)}</ul>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
