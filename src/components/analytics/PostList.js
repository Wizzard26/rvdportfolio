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
import {
    reorderPostsAction, reorderDocsInSpaceAction, deletePostAction, togglePostAction,
} from '@/lib/content/postsActions';

// Zeileninhalt (ohne DnD) — von statischer und sortierbarer Variante genutzt,
// damit erstes Client-Render und Server-Render identisch sind (kein Mismatch).
function PostRow({ post, type, spaceId }) {
    return (
        <>
            <div className="an-station-main">
                <div className="an-station-title">
                    {post.title || <span className="an-muted">(ohne Titel)</span>}
                    {post.categoryList?.slice(0, 3).map((c) => (
                        <span className="an-badge" key={c}>{c}</span>
                    ))}
                </div>
                <div className="an-station-sub">
                    {post.published_at && <span>{post.published_at} · </span>}
                    <span className="an-muted">/{type === 'doc' ? 'docs' : 'blog'}/{post.slug}</span>
                </div>
            </div>
            <div className="an-station-actions">
                <form action={togglePostAction} className="an-inline-form">
                    <input type="hidden" name="id" value={post.id} />
                    <input type="hidden" name="type" value={type} />
                    {spaceId ? <input type="hidden" name="space_id" value={spaceId} /> : null}
                    <input type="hidden" name="active" value={post.is_active ? '0' : '1'} />
                    <button
                        type="submit"
                        className={`an-status ${post.is_active ? 'is-active' : 'is-draft'}`}
                        title={post.is_active ? 'Aktiv – klicken, um auf Entwurf zu setzen' : 'Entwurf – klicken, um zu aktivieren'}
                    >
                        {post.is_active ? 'Aktiv' : 'Entwurf'}
                    </button>
                </form>
                <Link href={`/dashboard/blog/${post.id}`} className="an-icon-btn" title="Bearbeiten"><FiEdit2 /></Link>
                <form action={deletePostAction} className="an-inline-form">
                    <input type="hidden" name="id" value={post.id} />
                    <input type="hidden" name="type" value={type} />
                    {spaceId ? <input type="hidden" name="space_id" value={spaceId} /> : null}
                    <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button>
                </form>
            </div>
        </>
    );
}

function StaticPost({ post, type, spaceId }) {
    return (
        <li className="an-station">
            <span className="an-drag-handle" title="Ziehen"><FiMove aria-hidden="true" /></span>
            <PostRow post={post} type={type} spaceId={spaceId} />
        </li>
    );
}

function SortablePost({ post, type, spaceId }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <li ref={setNodeRef} style={style} className="an-station">
            <button type="button" className="an-drag-handle" title="Ziehen" {...attributes} {...listeners}>
                <FiMove aria-hidden="true" />
            </button>
            <PostRow post={post} type={type} spaceId={spaceId} />
        </li>
    );
}

// Sortierbare Beitragsliste je Typ. DnD erst nach dem Mount (siehe
// ShowcaseProjectList: @dnd-kit vergibt modul-globale IDs → sonst Hydration-
// Mismatch).
export default function PostList({ posts, type = 'blog', spaceId = null }) {
    const [items, setItems] = useState(posts);
    useEffect(() => { setItems(posts); }, [posts]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [, startTransition] = useTransition();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((p) => p.id === active.id);
        const newIndex = items.findIndex((p) => p.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(items, oldIndex, newIndex);
        setItems(next);
        const ids = next.map((p) => p.id);
        startTransition(() => (
            spaceId ? reorderDocsInSpaceAction(spaceId, ids) : reorderPostsAction(type, ids)
        ));
    };

    if (items.length === 0) {
        return <p className="an-empty">Noch keine {type === 'doc' ? 'Doku-Seiten' : 'Beiträge'}.</p>;
    }

    if (!mounted) {
        return (
            <ul className="an-stationlist">
                {items.map((p) => <StaticPost key={p.id} post={p} type={type} spaceId={spaceId} />)}
            </ul>
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <ul className="an-stationlist">
                    {items.map((p) => <SortablePost key={p.id} post={p} type={type} spaceId={spaceId} />)}
                </ul>
            </SortableContext>
        </DndContext>
    );
}
