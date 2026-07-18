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
import { FiMove, FiEdit2, FiTrash2, FiImage, FiVideo, FiBox } from 'react-icons/fi';
import { reorderProjectsAction, deleteProjectAction, toggleProjectAction } from '@/lib/content/showcaseActions';
import StatusToggle from '@/components/analytics/StatusToggle';

const MEDIA_ICON = { image: FiImage, video: FiVideo, component: FiBox };

// Gemeinsamer Zeileninhalt (ohne DnD) — von der statischen und der sortierbaren
// Variante genutzt, damit erste Client-Render und Server-Render identisch sind.
function ProjectRow({ project }) {
    const Icon = MEDIA_ICON[project.media_type];
    return (
        <>
            <div className="an-station-main">
                <div className="an-station-title">
                    {project.name}
                    {project.variant === 'compact' && <span className="an-badge">kompakt</span>}
                    {Icon && <span className="an-media-badge" title={project.media_type}><Icon aria-hidden="true" /></span>}
                </div>
                <div className="an-station-sub">{project.headline || project.techList.join(', ')}</div>
            </div>
            <div className="an-station-actions">
                <StatusToggle action={toggleProjectAction} id={project.id} active={!!project.is_active} />
                <Link href={`/dashboard/showcase/${project.id}`} className="an-icon-btn" title="Bearbeiten"><FiEdit2 /></Link>
                <form action={deleteProjectAction} className="an-inline-form">
                    <input type="hidden" name="id" value={project.id} />
                    <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button>
                </form>
            </div>
        </>
    );
}

function StaticProject({ project }) {
    return (
        <li className="an-station">
            <span className="an-drag-handle" title="Ziehen"><FiMove aria-hidden="true" /></span>
            <ProjectRow project={project} />
        </li>
    );
}

function SortableProject({ project }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <li ref={setNodeRef} style={style} className="an-station">
            <button type="button" className="an-drag-handle" title="Ziehen" {...attributes} {...listeners}>
                <FiMove aria-hidden="true" />
            </button>
            <ProjectRow project={project} />
        </li>
    );
}

function CategoryGroup({ label, items, mounted }) {
    return (
        <div className="an-catgroup">
            <h2 className="an-catgroup-title">{label} <span className="an-muted">· {items.length}</span></h2>
            {items.length === 0 ? (
                <p className="an-empty">Keine Projekte</p>
            ) : !mounted ? (
                <ul className="an-stationlist">
                    {items.map((p) => <StaticProject key={p.id} project={p} />)}
                </ul>
            ) : (
                <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <ul className="an-stationlist">
                        {items.map((p) => <SortableProject key={p.id} project={p} />)}
                    </ul>
                </SortableContext>
            )}
        </div>
    );
}

// Reihenfolge per Drag & Drop. Der DnD-Baum wird erst nach dem Mount aktiviert:
// @dnd-kit vergibt modul-globale IDs, die serverseitig über Requests hochzählen
// und sonst einen SSR-Hydration-Mismatch erzeugen. Ein gemeinsamer DndContext
// für beide Kategorien (zwei parallele erzeugen ebenfalls ID-Konflikte); Reorder
// bleibt pro Kategorie.
export default function ShowcaseProjectList({ projects }) {
    const split = (list) => ({
        shopware: list.filter((p) => p.category === 'shopware'),
        react: list.filter((p) => p.category === 'react'),
        codejs: list.filter((p) => p.category === 'codejs'),
    });
    const [lists, setLists] = useState(() => split(projects));
    useEffect(() => { setLists(split(projects)); }, [projects]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [, startTransition] = useTransition();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const categoryOf = (id) =>
        ['shopware', 'react', 'codejs'].find((c) => lists[c].some((p) => p.id === id));

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const cat = categoryOf(active.id);
        if (!cat || categoryOf(over.id) !== cat) return; // nicht über Kategoriegrenze sortieren
        const arr = lists[cat];
        const oldIndex = arr.findIndex((p) => p.id === active.id);
        const newIndex = arr.findIndex((p) => p.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(arr, oldIndex, newIndex);
        setLists((prev) => ({ ...prev, [cat]: next }));
        startTransition(() => reorderProjectsAction(cat, next.map((p) => p.id)));
    };

    if (!mounted) {
        return (
            <>
                <CategoryGroup label="Shopware" items={lists.shopware} mounted={false} />
                <CategoryGroup label="NextJs / React" items={lists.react} mounted={false} />
                <CategoryGroup label="JavaScript" items={lists.codejs} mounted={false} />
            </>
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <CategoryGroup label="Shopware" items={lists.shopware} mounted />
            <CategoryGroup label="NextJs / React" items={lists.react} mounted />
            <CategoryGroup label="JavaScript" items={lists.codejs} mounted />
        </DndContext>
    );
}
