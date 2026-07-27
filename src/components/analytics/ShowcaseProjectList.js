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
import AdminPager from '@/components/analytics/AdminPager';

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

const CATS = [
    { key: 'shopware', label: 'Shopware' },
    { key: 'react', label: 'NextJs / React' },
    { key: 'codejs', label: 'JavaScript' },
];
const PAGE_SIZE = 8;

// Kategorie-Unter-Tabs + Pagination, damit die Liste auch bei vielen Projekten
// übersichtlich bleibt. Reorder per Drag & Drop läuft pro Kategorie über die
// volle Liste (die aktuelle Seite ist nur der sichtbare Ausschnitt). Der DnD-Baum
// wird erst nach dem Mount aktiviert (sonst SSR-Hydration-Mismatch durch die
// modul-globalen @dnd-kit-IDs).
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

    const [activeCat, setActiveCat] = useState('shopware');
    const [page, setPage] = useState(1);
    const selectCat = (c) => { setActiveCat(c); setPage(1); };

    const [, startTransition] = useTransition();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const full = lists[activeCat] || [];
    const totalPages = Math.max(1, Math.ceil(full.length / PAGE_SIZE));
    const current = Math.min(page, totalPages);
    const pageItems = full.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

    // Reorder innerhalb der aktiven Kategorie über die VOLLE Liste (beide Items
    // sind auf der sichtbaren Seite; ihre Indizes in `full` werden getauscht).
    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = full.findIndex((p) => p.id === active.id);
        const newIndex = full.findIndex((p) => p.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(full, oldIndex, newIndex);
        setLists((prev) => ({ ...prev, [activeCat]: next }));
        startTransition(() => reorderProjectsAction(activeCat, next.map((p) => p.id)));
    };

    const listMarkup = pageItems.length === 0 ? (
        <p className="an-empty">Keine Projekte in dieser Kategorie</p>
    ) : !mounted ? (
        <ul className="an-stationlist">
            {pageItems.map((p) => <StaticProject key={p.id} project={p} />)}
        </ul>
    ) : (
        <SortableContext items={pageItems.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ul className="an-stationlist">
                {pageItems.map((p) => <SortableProject key={p.id} project={p} />)}
            </ul>
        </SortableContext>
    );

    return (
        <>
            <div className="an-tabs">
                {CATS.map((c) => (
                    <button key={c.key} type="button" onClick={() => selectCat(c.key)}
                            className={`an-tab${activeCat === c.key ? ' is-active' : ''}`}>
                        {c.label} <span className="an-muted">· {lists[c.key]?.length || 0}</span>
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
