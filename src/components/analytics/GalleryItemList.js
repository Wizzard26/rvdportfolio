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
import { reorderGalleryItemsAction, deleteGalleryItemAction, toggleGalleryItemAction } from '@/lib/content/galleryActions';
import { GALLERIES, GALLERY_LABELS } from '@/lib/galleryItems';
import StatusToggle from '@/components/analytics/StatusToggle';
import AdminPager from '@/components/analytics/AdminPager';

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
                <StatusToggle action={toggleGalleryItemAction} id={item.id} active={!!item.is_active} />
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

const PAGE_SIZE = 8;

// Galerie-Unter-Tabs + Pagination (wie bei den Showcase-Projekten). Reorder per
// Drag & Drop läuft pro Galerie über die volle Liste; die aktuelle Seite ist der
// sichtbare Ausschnitt. Der DnD-Baum mountet erst clientseitig (mounted-Flag) —
// sonst SSR-Hydration-Mismatch durch die modul-globalen @dnd-kit-IDs.
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

    const [activeGallery, setActiveGallery] = useState(GALLERIES[0]);
    const [page, setPage] = useState(1);
    const selectGallery = (g) => { setActiveGallery(g); setPage(1); };

    const [, startTransition] = useTransition();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const full = groups[activeGallery] || [];
    const totalPages = Math.max(1, Math.ceil(full.length / PAGE_SIZE));
    const current = Math.min(page, totalPages);
    const pageItems = full.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = full.findIndex((it) => it.id === active.id);
        const newIndex = full.findIndex((it) => it.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(full, oldIndex, newIndex);
        setGroups((prev) => ({ ...prev, [activeGallery]: next }));
        startTransition(() => reorderGalleryItemsAction(activeGallery, next.map((it) => it.id)));
    };

    const listMarkup = pageItems.length === 0 ? (
        <p className="an-empty">Keine Einträge in dieser Galerie</p>
    ) : !mounted ? (
        <ul className="an-stationlist">
            {pageItems.map((it) => <StaticItem key={it.id} item={it} />)}
        </ul>
    ) : (
        <SortableContext items={pageItems.map((it) => it.id)} strategy={verticalListSortingStrategy}>
            <ul className="an-stationlist">
                {pageItems.map((it) => <SortableItem key={it.id} item={it} />)}
            </ul>
        </SortableContext>
    );

    return (
        <>
            <div className="an-tabs">
                {GALLERIES.map((g) => (
                    <button key={g} type="button" onClick={() => selectGallery(g)}
                            className={`an-tab${activeGallery === g ? ' is-active' : ''}`}>
                        {GALLERY_LABELS[g]} <span className="an-muted">· {groups[g]?.length || 0}</span>
                    </button>
                ))}
            </div>

            {mounted ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    {listMarkup}
                </DndContext>
            ) : listMarkup}

            {totalPages > 1 && <AdminPager page={current} totalPages={totalPages} onChange={setPage} />}
        </>
    );
}
