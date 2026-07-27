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
import { FiMove, FiEdit2, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { reorderTestimonialsAction, deleteTestimonialAction, toggleTestimonialAction } from '@/lib/content/testimonialsActions';
import StatusToggle from '@/components/analytics/StatusToggle';

function Row({ t }) {
    const meta = [t.role, t.company].filter(Boolean).join(' · ');
    return (
        <>
            <span className="an-media-badge" title="Referenz"><FiMessageSquare aria-hidden="true" /></span>
            <div className="an-station-main">
                <div className="an-station-title">{t.author || '(ohne Autor)'}{meta && <span className="an-badge">{meta}</span>}</div>
                <div className="an-station-sub">{t.quote}</div>
            </div>
            <div className="an-station-actions">
                <StatusToggle action={toggleTestimonialAction} id={t.id} active={!!t.is_active} />
                <Link href={`/dashboard/referenzen/${t.id}`} className="an-icon-btn" title="Bearbeiten"><FiEdit2 /></Link>
                <form action={deleteTestimonialAction} className="an-inline-form">
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button>
                </form>
            </div>
        </>
    );
}

function StaticRow({ t }) {
    return (
        <li className="an-station">
            <span className="an-drag-handle" title="Ziehen"><FiMove aria-hidden="true" /></span>
            <Row t={t} />
        </li>
    );
}

function SortableRow({ t }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: t.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <li ref={setNodeRef} style={style} className="an-station">
            <button type="button" className="an-drag-handle" title="Ziehen" {...attributes} {...listeners}>
                <FiMove aria-hidden="true" />
            </button>
            <Row t={t} />
        </li>
    );
}

// DnD-Baum erst nach dem Mount (client-only), sonst @dnd-kit SSR-Hydration-Mismatch.
export default function TestimonialList({ testimonials }) {
    const [items, setItems] = useState(testimonials);
    useEffect(() => { setItems(testimonials); }, [testimonials]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [, startTransition] = useTransition();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((t) => t.id === active.id);
        const newIndex = items.findIndex((t) => t.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(items, oldIndex, newIndex);
        setItems(next);
        startTransition(() => reorderTestimonialsAction(next.map((t) => t.id)));
    };

    if (items.length === 0) return <p className="an-empty">Noch keine Referenzen – füge oben die erste hinzu.</p>;

    if (!mounted) {
        return <ul className="an-stationlist">{items.map((t) => <StaticRow key={t.id} t={t} />)}</ul>;
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <ul className="an-stationlist">{items.map((t) => <SortableRow key={t.id} t={t} />)}</ul>
            </SortableContext>
        </DndContext>
    );
}
