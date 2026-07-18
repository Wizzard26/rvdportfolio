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
import { FiMove, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { reorderGalleryItemsAction, deleteGalleryItemAction } from '@/lib/content/galleryActions';
import { GALLERIES, GALLERY_LABELS } from '@/lib/galleryItems';

function Row({ item }) {
    return (
        <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="an-thumb" src={item.image} alt="" width={44} height={44} />
            <div className="an-station-main">
                <div className="an-station-title">{item.title || '(ohne Titel)'}</div>
                {item.description && <div className="an-station-sub">{item.description}</div>}
                {!item.description && item.technik && <div className="an-station-sub">{item.technik}</div>}
            </div>
            <div className="an-station-actions">
                <Link href={`/dashboard/showcase/galerien/${item.id}`} className="an-icon-btn" title="Bearbeiten"><FiEdit2 /></Link>
                <form action={deleteGalleryItemAction} className="an-inline-form">
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button>
                </form>
            </div>
        </>
    );
}

function StaticItem({ item }) {
    return (
        <li className="an-station">
            <span className="an-drag-handle" title="Ziehen"><FiMove aria-hidden="true" /></span>
            <Row item={item} />
        </li>
    );
}

function SortableItem({ item }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <li ref={setNodeRef} style={style} className="an-station">
            <button type="button" className="an-drag-handle" title="Ziehen" {...attributes} {...listeners}>
                <FiMove aria-hidden="true" />
            </button>
            <Row item={item} />
        </li>
    );
}

function GalleryGroup({ label, items, mounted }) {
    return (
        <div className="an-catgroup">
            <h2 className="an-catgroup-title">{label} <span className="an-muted">· {items.length}</span></h2>
            {items.length === 0 ? (
                <p className="an-empty">Keine Einträge</p>
            ) : !mounted ? (
                <ul className="an-stationlist">
                    {items.map((it) => <StaticItem key={it.id} item={it} />)}
                </ul>
            ) : (
                <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
                    <ul className="an-stationlist">
                        {items.map((it) => <SortableItem key={it.id} item={it} />)}
                    </ul>
                </SortableContext>
            )}
        </div>
    );
}

// Ein gemeinsamer DndContext über alle vier Galerien; Reorder bleibt pro Galerie.
// Der DnD-Baum mountet erst clientseitig (mounted-Flag) — sonst SSR-Hydration-
// Mismatch durch @dnd-kit-interne IDs (wie bei den Showcase-Projekten).
export default function GalleryItemList({ items }) {
    const split = (list) => {
        const map = {};
        for (const g of GALLERIES) map[g] = [];
        for (const it of list) (map[it.gallery] || (map[it.gallery] = [])).push(it);
        return map;
    };
    const [groups, setGroups] = useState(() => split(items));
    useEffect(() => { setGroups(split(items)); }, [items]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [, startTransition] = useTransition();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const galleryOf = (id) => GALLERIES.find((g) => groups[g]?.some((it) => it.id === id));

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const g = galleryOf(active.id);
        if (!g || galleryOf(over.id) !== g) return; // nicht über Galeriegrenze
        const arr = groups[g];
        const oldIndex = arr.findIndex((it) => it.id === active.id);
        const newIndex = arr.findIndex((it) => it.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(arr, oldIndex, newIndex);
        setGroups((prev) => ({ ...prev, [g]: next }));
        startTransition(() => reorderGalleryItemsAction(g, next.map((it) => it.id)));
    };

    const render = (mnt) => GALLERIES.map((g) => (
        <GalleryGroup key={g} label={GALLERY_LABELS[g]} items={groups[g] || []} mounted={mnt} />
    ));

    if (!mounted) return <>{render(false)}</>;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            {render(true)}
        </DndContext>
    );
}
