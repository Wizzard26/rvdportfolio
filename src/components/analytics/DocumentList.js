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
import { FiMove, FiEdit2, FiTrash2, FiFileText, FiExternalLink } from 'react-icons/fi';
import { reorderDocumentsAction, deleteDocumentAction, toggleDocumentAction } from '@/lib/content/documentsActions';
import StatusToggle from '@/components/analytics/StatusToggle';

function Row({ doc }) {
    return (
        <>
            <span className="an-media-badge" title="PDF"><FiFileText aria-hidden="true" /></span>
            <div className="an-station-main">
                <div className="an-station-title">
                    {doc.title || '(ohne Titel)'}
                    {doc.slug && <span className="an-badge">{doc.slug}</span>}
                </div>
                <div className="an-station-sub">
                    <a href={doc.file} target="_blank" rel="noreferrer">{doc.file} <FiExternalLink aria-hidden="true" /></a>
                </div>
            </div>
            <div className="an-station-actions">
                <StatusToggle action={toggleDocumentAction} id={doc.id} active={!!doc.is_active} />
                <Link href={`/dashboard/dokumente/${doc.id}`} className="an-icon-btn" title="Bearbeiten"><FiEdit2 /></Link>
                <form action={deleteDocumentAction} className="an-inline-form">
                    <input type="hidden" name="id" value={doc.id} />
                    <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button>
                </form>
            </div>
        </>
    );
}

function StaticRow({ doc }) {
    return (
        <li className="an-station">
            <span className="an-drag-handle" title="Ziehen"><FiMove aria-hidden="true" /></span>
            <Row doc={doc} />
        </li>
    );
}

function SortableRow({ doc }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: doc.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <li ref={setNodeRef} style={style} className="an-station">
            <button type="button" className="an-drag-handle" title="Ziehen" {...attributes} {...listeners}>
                <FiMove aria-hidden="true" />
            </button>
            <Row doc={doc} />
        </li>
    );
}

// DnD-Baum erst nach dem Mount (client-only), sonst @dnd-kit SSR-Hydration-Mismatch.
export default function DocumentList({ documents }) {
    const [items, setItems] = useState(documents);
    useEffect(() => { setItems(documents); }, [documents]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [, startTransition] = useTransition();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((d) => d.id === active.id);
        const newIndex = items.findIndex((d) => d.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(items, oldIndex, newIndex);
        setItems(next);
        startTransition(() => reorderDocumentsAction(next.map((d) => d.id)));
    };

    if (items.length === 0) return <p className="an-empty">Noch keine Dokumente</p>;

    if (!mounted) {
        return <ul className="an-stationlist">{items.map((d) => <StaticRow key={d.id} doc={d} />)}</ul>;
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                <ul className="an-stationlist">{items.map((d) => <SortableRow key={d.id} doc={d} />)}</ul>
            </SortableContext>
        </DndContext>
    );
}
