'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import {
    DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, arrayMove, useSortable, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMove, FiTrash2, FiPlus } from 'react-icons/fi';
import {
    createCategoryAction, deleteCategoryAction, reorderCategoriesAction, toggleCategoryAction,
} from '@/lib/content/categoriesActions';

function CategoryRow({ cat }) {
    return (
        <>
            <div className="an-station-main">
                <div className="an-station-title">{cat.name}</div>
            </div>
            <div className="an-station-actions">
                <form action={toggleCategoryAction} className="an-inline-form">
                    <input type="hidden" name="id" value={cat.id} />
                    <input type="hidden" name="active" value={cat.is_active ? '0' : '1'} />
                    <button
                        type="submit"
                        className={`an-status ${cat.is_active ? 'is-active' : 'is-draft'}`}
                        title={cat.is_active ? 'Aktiv – klicken für inaktiv' : 'Inaktiv – klicken zum Aktivieren'}
                    >
                        {cat.is_active ? 'Aktiv' : 'Inaktiv'}
                    </button>
                </form>
                <form action={deleteCategoryAction} className="an-inline-form">
                    <input type="hidden" name="id" value={cat.id} />
                    <button type="submit" className="an-icon-btn an-danger" title="Löschen"><FiTrash2 /></button>
                </form>
            </div>
        </>
    );
}

function StaticCategory({ cat }) {
    return (
        <li className="an-station">
            <span className="an-drag-handle" title="Ziehen"><FiMove aria-hidden="true" /></span>
            <CategoryRow cat={cat} />
        </li>
    );
}

function SortableCategory({ cat }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <li ref={setNodeRef} style={style} className="an-station">
            <button type="button" className="an-drag-handle" title="Ziehen" {...attributes} {...listeners}>
                <FiMove aria-hidden="true" />
            </button>
            <CategoryRow cat={cat} />
        </li>
    );
}

export default function CategoryManager({ categories }) {
    const [items, setItems] = useState(categories);
    useEffect(() => { setItems(categories); }, [categories]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const formRef = useRef(null);
    const [state, formAction, pending] = useActionState(createCategoryAction, { error: null });
    // Nach erfolgreichem Anlegen das Eingabefeld leeren.
    useEffect(() => { if (state.ok) formRef.current?.reset(); }, [state]);

    const [, startTransition] = useTransition();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((c) => c.id === active.id);
        const newIndex = items.findIndex((c) => c.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(items, oldIndex, newIndex);
        setItems(next);
        startTransition(() => reorderCategoriesAction(next.map((c) => c.id)));
    };

    return (
        <div className="an-catmanager">
            <form ref={formRef} action={formAction} className="an-inline-add">
                <input name="name" placeholder="Neue Kategorie …" aria-label="Neue Kategorie" required />
                <button type="submit" className="an-btn-primary" disabled={pending}>
                    <FiPlus aria-hidden="true" /> Hinzufügen
                </button>
            </form>
            {state.error && <p className="an-form-error" role="alert">{state.error}</p>}

            {items.length === 0 ? (
                <p className="an-empty">Noch keine Kategorien.</p>
            ) : !mounted ? (
                <ul className="an-stationlist">
                    {items.map((c) => <StaticCategory key={c.id} cat={c} />)}
                </ul>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                        <ul className="an-stationlist">
                            {items.map((c) => <SortableCategory key={c.id} cat={c} />)}
                        </ul>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
