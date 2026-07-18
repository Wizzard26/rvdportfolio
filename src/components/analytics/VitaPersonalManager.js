'use client';

import { useEffect, useState, useTransition } from 'react';
import { useActionState } from 'react';
import {
    DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { FiPlus } from 'react-icons/fi';
import {
    createAreaAction, reorderAreasAction, reorderEntriesAction,
} from '@/lib/content/vitaPersonalActions';
import PersonalAreaCard from './PersonalAreaCard';

// IDs sind über beide Ebenen eindeutig gemacht (Bereich-IDs und Eintrag-IDs
// können sich sonst überschneiden): `area-<id>` bzw. `entry-<id>`.

// Formular für einen neuen Bereich.
function NewAreaForm() {
    const [state, action, pending] = useActionState(createAreaAction, { ok: false });
    return (
        <form action={action} className="an-newarea">
            <input name="title" placeholder="Bereichs-Überschrift (z. B. Sprachkenntnisse:)" className="an-newarea-input" />
            <label className="an-check">
                <input type="checkbox" name="show_headline" defaultChecked /> Überschrift anzeigen
            </label>
            <button type="submit" className="an-btn-primary" disabled={pending}>
                <FiPlus aria-hidden="true" /> Bereich
            </button>
        </form>
    );
}

export default function VitaPersonalManager({ areas, documents }) {
    // Der Manager hält den kompletten (verschachtelten) Zustand — nötig, damit
    // EIN DndContext beide Ebenen (Bereiche + Einträge) koordinieren kann.
    const [items, setItems] = useState(areas);
    useEffect(() => { setItems(areas); }, [areas]);
    const [, startTransition] = useTransition();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    // In EINEM DndContext sind Bereiche UND Einträge sortierbar. Beim Ziehen
    // eines Bereichs kann das Drop-Ziel (`over`) auf einem Eintrag liegen —
    // dann lösen wir dessen Elternbereich als Ziel auf.
    const areaIdxByEntryId = (entryId) => items.findIndex((area) => area.entries.some((e) => e.id === entryId));

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const a = String(active.id);
        const o = String(over.id);

        // ── Bereich ziehen ──────────────────────────────────────────────
        if (a.startsWith('area-')) {
            let targetAreaId;
            if (o.startsWith('area-')) {
                targetAreaId = Number(o.slice('area-'.length));
            } else if (o.startsWith('entry-')) {
                const idx = areaIdxByEntryId(Number(o.slice('entry-'.length)));
                if (idx < 0) return;
                targetAreaId = items[idx].id;
            } else return;

            const oldIndex = items.findIndex((x) => x.id === Number(a.slice('area-'.length)));
            const newIndex = items.findIndex((x) => x.id === targetAreaId);
            if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

            const next = arrayMove(items, oldIndex, newIndex);
            setItems(next);
            startTransition(() => reorderAreasAction(next.map((x) => x.id)));
            return;
        }

        // ── Eintrag ziehen (nur innerhalb seines Bereichs) ──────────────
        if (a.startsWith('entry-') && o.startsWith('entry-')) {
            const entryId = Number(a.slice('entry-'.length));
            const areaIdx = areaIdxByEntryId(entryId);
            if (areaIdx < 0) return;
            const entries = items[areaIdx].entries;
            const oldIndex = entries.findIndex((e) => e.id === entryId);
            const newIndex = entries.findIndex((e) => `entry-${e.id}` === o);
            if (newIndex < 0 || oldIndex === newIndex) return; // Ziel in anderem Bereich → ignorieren
            const nextEntries = arrayMove(entries, oldIndex, newIndex);
            const next = items.map((area, idx) => (idx === areaIdx ? { ...area, entries: nextEntries } : area));
            setItems(next);
            startTransition(() => reorderEntriesAction(items[areaIdx].id, nextEntries.map((e) => e.id)));
        }
    };

    return (
        <>
            <NewAreaForm />

            {items.length === 0 ? (
                <p className="an-empty">Noch keine Bereiche</p>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items.map((a) => `area-${a.id}`)} strategy={verticalListSortingStrategy}>
                        {items.map((area) => (
                            <PersonalAreaCard key={area.id} area={area} documents={documents} />
                        ))}
                    </SortableContext>
                </DndContext>
            )}
        </>
    );
}
