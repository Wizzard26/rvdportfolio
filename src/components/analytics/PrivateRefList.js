'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import {
    DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, arrayMove, useSortable, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMove, FiEdit2, FiTrash2, FiEyeOff, FiImage } from 'react-icons/fi';
import { reorderPrivateRefsAction, deletePrivateRefAction, togglePrivateRefAction } from '@/lib/content/privateRefsActions';
import StatusToggle from '@/components/analytics/StatusToggle';
import { PRIVATE_REF_STATUS_LABEL as STATUS_LABEL } from '@/lib/privateRefStatus';

function Row({ r }) {
    const meta = [r.context, STATUS_LABEL[r.status] || r.status].filter(Boolean).join(' · ');
    return (
        <>
            <span className="an-media-badge" title="Vertrauliche Referenz"><FiEyeOff aria-hidden="true" /></span>
            <div className="an-station-main">
                <div className="an-station-title">{r.title || '(ohne Titel)'}{meta && <span className="an-badge">{meta}</span>}</div>
                <div className="an-station-sub">
                    {r.image_count > 0 && <span className="an-badge"><FiImage aria-hidden="true" /> {r.image_count}</span>}
                    {r.description}
                </div>
            </div>
            <div className="an-station-actions">
                <StatusToggle action={togglePrivateRefAction} id={r.id} active={!!r.is_active} />
                <Link href={`/dashboard/vertrauliche-referenzen/${r.id}`} className="an-icon-btn" title="Bearbeiten"><FiEdit2 /></Link>
                <form action={deletePrivateRefAction} className="an-inline-form">
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button>
                </form>
            </div>
        </>
    );
}

function StaticRow({ r }) {
    return (
        <li className="an-station">
            <span className="an-drag-handle" title="Ziehen"><FiMove aria-hidden="true" /></span>
            <Row r={r} />
        </li>
    );
}

function SortableRow({ r }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: r.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <li ref={setNodeRef} style={style} className="an-station">
            <button type="button" className="an-drag-handle" title="Ziehen" {...attributes} {...listeners}>
                <FiMove aria-hidden="true" />
            </button>
            <Row r={r} />
        </li>
    );
}

// DnD-Baum erst nach dem Mount (client-only), sonst @dnd-kit SSR-Hydration-Mismatch.
export default function PrivateRefList({ refs }) {
    const [items, setItems] = useState(refs);
    useEffect(() => { setItems(refs); }, [refs]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [, startTransition] = useTransition();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((r) => r.id === active.id);
        const newIndex = items.findIndex((r) => r.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(items, oldIndex, newIndex);
        setItems(next);
        startTransition(() => reorderPrivateRefsAction(next.map((r) => r.id)));
    };

    if (items.length === 0) return <p className="an-empty">Noch keine vertraulichen Referenzen – füge oben die erste hinzu.</p>;

    if (!mounted) {
        return <ul className="an-stationlist">{items.map((r) => <StaticRow key={r.id} r={r} />)}</ul>;
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                <ul className="an-stationlist">{items.map((r) => <SortableRow key={r.id} r={r} />)}</ul>
            </SortableContext>
        </DndContext>
    );
}
