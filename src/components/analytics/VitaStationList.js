'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
    DndContext, closestCenter, PointerSensor, KeyboardSensor,
    useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, arrayMove,
    useSortable, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiEdit2, FiTrash2, FiMove } from 'react-icons/fi';
import { deleteStationAction, reorderStationsAction } from '@/lib/content/vitaActions';

// Eine sortierbare Zeile (Station). Der Ziehgriff (FiMove) ist bewusst separat,
// damit Bearbeiten/Löschen nicht versehentlich einen Drag auslösen.
function SortableRow({ station }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: station.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 2 : undefined,
    };

    return (
        <li ref={setNodeRef} style={style} className="an-station">
            <button
                type="button"
                className="an-drag-handle"
                title="Zum Sortieren ziehen"
                {...attributes}
                {...listeners}
            >
                <FiMove aria-hidden="true" />
            </button>

            <div className="an-station-main">
                <div className="an-station-title">{station.title}</div>
                <div className="an-station-sub">
                    {station.company} · {station.start} – {station.is_current ? 'läuft noch' : station.end}
                </div>
            </div>

            <div className="an-station-actions">
                <Link href={`/dashboard/vita/${station.id}`} className="an-icon-btn" title="Bearbeiten"><FiEdit2 /></Link>
                <form action={deleteStationAction} className="an-inline-form">
                    <input type="hidden" name="id" value={station.id} />
                    <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button>
                </form>
            </div>
        </li>
    );
}

export default function VitaStationList({ stations }) {
    const [items, setItems] = useState(stations);
    const [, startTransition] = useTransition();

    const sensors = useSensors(
        // 6px Aktivierungsdistanz: normale Klicks auf Bearbeiten/Löschen lösen
        // keinen Drag aus.
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((s) => s.id === active.id);
        const newIndex = items.findIndex((s) => s.id === over.id);
        const next = arrayMove(items, oldIndex, newIndex);
        setItems(next); // optimistisch sofort umsortieren

        // Neue Reihenfolge (oben zuerst) serverseitig persistieren.
        startTransition(() => {
            reorderStationsAction(next.map((s) => s.id));
        });
    };

    if (items.length === 0) {
        return <p className="an-empty">Noch keine Stationen</p>;
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <ul className="an-stationlist">
                    {items.map((station) => (
                        <SortableRow key={station.id} station={station} />
                    ))}
                </ul>
            </SortableContext>
        </DndContext>
    );
}
