'use client';

import { useEffect, useState, useTransition } from 'react';
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
import { FiMove, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import { toggleMerklisteAction, reorderMerklisteAction } from '@/lib/content/radarActions';

const EIGNUNG = {
    bewerbung: { label: 'Bewerbung', cls: 'an-badge--ok' },
    akquise: { label: 'Akquise', cls: 'an-badge--warn' },
    beides: { label: 'Bew. + Akq.', cls: '' },
    unklar: { label: '?', cls: '' },
};
const TYP_LABEL = {
    inhouse_shop: 'Inhouse-Shop', agentur: 'Agentur', hersteller: 'Hersteller',
    dienstleister: 'Dienstleister', unbekannt: 'unbekannt',
};
const PLAT_LABEL = {
    shopware6: 'Shopware 6', shopware5: 'Shopware 5', shopify: 'Shopify',
    woocommerce: 'WooCommerce', magento: 'Magento', oxid: 'Oxid', custom: 'Custom', unbekannt: '—',
};

function SortableRow({ company, rank }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: company.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 2 : undefined,
    };
    const eig = EIGNUNG[company.eignung] || EIGNUNG.unklar;

    return (
        <li ref={setNodeRef} style={style} className="an-station">
            <button type="button" className="an-drag-handle" title="Zum Sortieren ziehen" {...attributes} {...listeners}>
                <FiMove aria-hidden="true" />
            </button>

            <span className="an-badge" title="Reihenfolge" style={{ minWidth: 26, justifyContent: 'center' }}>{rank}</span>

            <div className="an-station-main">
                <div className="an-station-title">
                    <Link href={`/dashboard/radar/${company.id}`}>{company.name || company.domain || '(ohne Name)'}</Link>
                    <span className={`an-badge ${eig.cls}`}>{eig.label}</span>
                    {company.beworben_count > 0 && <span className="an-badge an-badge--ok" title="hier bereits beworben"><FiCheckCircle aria-hidden="true" /> beworben</span>}
                </div>
                <div className="an-station-sub">
                    {TYP_LABEL[company.typ] || company.typ}
                    {company.plattform && company.plattform !== 'unbekannt' ? ` · ${PLAT_LABEL[company.plattform] || company.plattform}${company.version ? ' ' + company.version : ''}` : ''}
                    {(company.plz || company.ort) ? ` · ${[company.plz, company.ort].filter(Boolean).join(' ')}` : ''}
                    {company.opp_count ? ` · ${company.opp_count} ${company.opp_count === 1 ? 'Chance' : 'Chancen'}` : ''}
                </div>
            </div>

            <div className="an-station-actions">
                {company.domain && (
                    <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="an-icon-btn" title="Website öffnen"><FiExternalLink /></a>
                )}
                <Link href={`/dashboard/radar/${company.id}`} className="an-btn-secondary an-btn-small">Öffnen</Link>
                <form action={toggleMerklisteAction} className="an-inline-form">
                    <input type="hidden" name="id" value={company.id} />
                    <input type="hidden" name="on" value="0" />
                    <button type="submit" className="an-btn-secondary an-btn-small an-danger" title="Von der Merkliste entfernen">Entfernen</button>
                </form>
            </div>
        </li>
    );
}

export default function MerklisteBoard({ companies }) {
    const [items, setItems] = useState(companies);
    useEffect(() => { setItems(companies); }, [companies]);
    const [, startTransition] = useTransition();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((c) => c.id === active.id);
        const newIndex = items.findIndex((c) => c.id === over.id);
        const next = arrayMove(items, oldIndex, newIndex);
        setItems(next); // optimistisch
        startTransition(() => { reorderMerklisteAction(next.map((c) => c.id)); });
    };

    if (items.length === 0) {
        return <p className="an-empty">Deine Merkliste ist leer. Leg im Radar über das Lesezeichen-Symbol Firmen ab, auf die du dich der Reihe nach bewerben willst.</p>;
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <ul className="an-stationlist">
                    {items.map((company, i) => (
                        <SortableRow key={company.id} company={company} rank={i + 1} />
                    ))}
                </ul>
            </SortableContext>
        </DndContext>
    );
}
