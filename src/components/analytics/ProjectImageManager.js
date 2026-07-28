'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, arrayMove, useSortable, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMove, FiTrash2, FiCpu, FiUploadCloud, FiVideo, FiLink, FiEdit2, FiPlayCircle } from 'react-icons/fi';
import {
    addProjectImagesAction, addProjectVideoAction, addProjectEmbedAction,
    updateProjectImageAction, deleteProjectImageAction,
    toggleProjectImageAiAction, toggleProjectImageAutoplayAction, reorderProjectImagesAction,
} from '@/lib/content/showcaseImageActions';
import { itemKind, embedInfo } from '@/lib/videoEmbed';

const KIND_LABEL = { image: 'Bild', video: 'Video', embed: 'Embed' };

// Vorschau je Art (Bild / Video-Frame / Embed-Proxy-Thumbnail).
function Thumb({ img }) {
    const kind = itemKind(img);
    if (kind === 'video') {
        return <video className="an-thumb" src={`${img.image}#t=0.1`} muted playsInline preload="metadata" width={44} height={44} />;
    }
    if (kind === 'embed') {
        const info = embedInfo(img.image);
        const p = info?.provider === 'Vimeo' ? 'vimeo' : 'youtube';
        // eslint-disable-next-line @next/next/no-img-element
        if (info?.id) return <img className="an-thumb" src={`/api/embedthumb?p=${p}&id=${info.id}`} alt="" width={44} height={44} />;
        return <span className="an-media-badge" title="Embed"><FiLink aria-hidden="true" /></span>;
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="an-thumb" src={img.image} alt="" width={44} height={44} />;
}

// Bearbeiten-Panel: KI-Flag, Autoplay (Video/Embed) und Quelle ersetzen.
function EditPanel({ img, projectId, imageOptions, onClose }) {
    const router = useRouter();
    const kind = itemKind(img);
    const info = kind === 'embed' ? embedInfo(img.image) : null;
    const [state, formAction, pending] = useActionState(updateProjectImageAction, {});
    useEffect(() => { if (state?.ok) { router.refresh(); onClose(); } }, [state, router, onClose]);

    return (
        <form action={formAction} className="an-imgeditor">
            <input type="hidden" name="id" value={img.id} />
            <input type="hidden" name="project_id" value={projectId} />

            {kind === 'image' && (
                <div className="an-field-row">
                    <label className="an-field"><span>Bild ersetzen (Upload)</span>
                        <input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" /></label>
                    {imageOptions.length > 0 && (
                        <label className="an-field"><span>oder vorhandenes Bild</span>
                            <select name="image_select" defaultValue="">
                                <option value="">— behalten —</option>
                                {imageOptions.map((im) => <option key={im.link} value={im.link}>{im.label}</option>)}
                            </select></label>
                    )}
                </div>
            )}
            {kind === 'video' && (
                <label className="an-field"><span>Video ersetzen <span className="an-muted">(MP4/WEBM, max. 25 MB)</span></span>
                    <input type="file" name="video" accept="video/mp4,video/webm" /></label>
            )}
            {kind === 'embed' && (
                <label className="an-field"><span>Video-Link ändern</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <select name="embed_provider" defaultValue={info?.provider === 'Vimeo' ? 'vimeo' : 'youtube'} style={{ flex: '0 0 120px' }}>
                            <option value="youtube">YouTube</option>
                            <option value="vimeo">Vimeo</option>
                        </select>
                        <input name="embed_id" defaultValue={info?.id || ''} placeholder="Video-ID oder Link" style={{ flex: '1 1 auto', minWidth: 0 }} />
                    </div>
                </label>
            )}

            <label className="an-check">
                <input type="checkbox" name="ai_image" defaultChecked={!!img.ai_image} />
                <span>KI-Inhalt (Badge „KI-Bild"/„KI-Video")</span>
            </label>
            {kind !== 'image' && (
                <label className="an-check">
                    <input type="checkbox" name="autoplay" defaultChecked={!!img.autoplay} />
                    <span>Autoplay beim Öffnen <span className="an-muted">(startet stumm; Ton erst bei aktivem Start)</span></span>
                </label>
            )}

            {state?.error && <p className="an-form-error">{state.error}</p>}
            <div className="an-form-actions">
                <button type="submit" className="an-btn-primary an-btn-small" disabled={pending}>{pending ? 'Speichern…' : 'Speichern'}</button>
                <button type="button" className="an-btn-secondary an-btn-small" onClick={onClose}>Abbrechen</button>
            </div>
        </form>
    );
}

// Aktionsleiste + Info einer Item-Zeile.
function RowInner({ img, projectId, editing, onToggleEdit }) {
    const kind = itemKind(img);
    const info = kind === 'embed' ? embedInfo(img.image) : null;
    const title = kind === 'embed' ? `${info?.provider || 'Embed'} · ${info?.id || ''}` : (img.image || '').split('/').pop();
    const sub = [KIND_LABEL[kind], img.ai_image ? 'KI' : null, (kind !== 'image' && img.autoplay) ? 'Autoplay' : null].filter(Boolean).join(' · ');
    return (
        <>
            <Thumb img={img} />
            <div className="an-station-main">
                <div className="an-station-title">
                    {kind === 'video' && <span className="an-media-badge" title="Video"><FiVideo aria-hidden="true" /></span>}
                    {title}
                </div>
                <div className="an-station-sub">{sub}</div>
            </div>
            <div className="an-station-actions">
                {/* KI-Flag – für alle Arten */}
                <form action={toggleProjectImageAiAction} className="an-inline-form">
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="ai" value={img.ai_image ? '0' : '1'} />
                    <button type="submit" className={`an-icon-btn${img.ai_image ? ' is-active' : ''}`} title={img.ai_image ? 'KI-Kennzeichnung entfernen' : 'Als KI-Inhalt markieren'}>
                        <FiCpu aria-hidden="true" />
                    </button>
                </form>
                {/* Autoplay – nur Video/Embed */}
                {kind !== 'image' && (
                    <form action={toggleProjectImageAutoplayAction} className="an-inline-form">
                        <input type="hidden" name="id" value={img.id} />
                        <input type="hidden" name="project_id" value={projectId} />
                        <input type="hidden" name="autoplay" value={img.autoplay ? '0' : '1'} />
                        <button type="submit" className={`an-icon-btn${img.autoplay ? ' is-active' : ''}`} title={img.autoplay ? 'Autoplay aus' : 'Autoplay an (stumm)'}>
                            <FiPlayCircle aria-hidden="true" />
                        </button>
                    </form>
                )}
                <button type="button" className={`an-icon-btn${editing ? ' is-active' : ''}`} title="Bearbeiten" onClick={onToggleEdit}>
                    <FiEdit2 aria-hidden="true" />
                </button>
                <form action={deleteProjectImageAction} className="an-inline-form">
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="project_id" value={projectId} />
                    <button type="submit" className="an-icon-btn an-danger" title="Entfernen"><FiTrash2 /></button>
                </form>
            </div>
        </>
    );
}

function ImageItem({ img, projectId, imageOptions, handle, dragRef, dragStyle }) {
    const [editing, setEditing] = useState(false);
    return (
        <li ref={dragRef} style={dragStyle} className="an-imgitem">
            <div className="an-station">
                {handle}
                <RowInner img={img} projectId={projectId} editing={editing} onToggleEdit={() => setEditing((e) => !e)} />
            </div>
            {editing && <EditPanel img={img} projectId={projectId} imageOptions={imageOptions} onClose={() => setEditing(false)} />}
        </li>
    );
}

function StaticItem(props) {
    return <ImageItem {...props} handle={<span className="an-drag-handle" title="Ziehen"><FiMove aria-hidden="true" /></span>} />;
}

function SortableItem(props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.img.id });
    const dragStyle = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <ImageItem
            {...props}
            dragRef={setNodeRef}
            dragStyle={dragStyle}
            handle={<button type="button" className="an-drag-handle" title="Ziehen" {...attributes} {...listeners}><FiMove aria-hidden="true" /></button>}
        />
    );
}

export default function ProjectImageManager({ projectId, images = [], imageOptions = [] }) {
    const router = useRouter();
    const [list, setList] = useState(images);
    useEffect(() => { setList(images); }, [images]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [imgState, imgAction, imgPending] = useActionState(addProjectImagesAction, {});
    const [vidState, vidAction, vidPending] = useActionState(addProjectVideoAction, {});
    const [embState, embAction, embPending] = useActionState(addProjectEmbedAction, {});
    useEffect(() => {
        if (imgState?.ok || vidState?.ok || embState?.ok) router.refresh();
    }, [imgState, vidState, embState, router]);

    const [, startTransition] = useTransition();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = list.findIndex((i) => i.id === active.id);
        const newIndex = list.findIndex((i) => i.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(list, oldIndex, newIndex);
        setList(next);
        startTransition(() => reorderProjectImagesAction(projectId, next.map((i) => i.id)));
    };

    const itemProps = (img) => ({ img, projectId, imageOptions });

    return (
        <div>
            {/* Bilder: mehrere auf einmal + optional vorhandenes Bild */}
            <form action={imgAction} className="an-form" style={{ marginBottom: 16 }}>
                <input type="hidden" name="project_id" value={projectId} />
                <div className="an-field-row">
                    <label className="an-field">
                        <span>Bilder hochladen (Mehrfachauswahl möglich)</span>
                        <input type="file" name="images" multiple accept="image/png,image/jpeg,image/webp,image/gif" />
                    </label>
                    {imageOptions.length > 0 && (
                        <label className="an-field">
                            <span>oder ein vorhandenes Bild hinzufügen</span>
                            <select name="image_select" defaultValue="">
                                <option value="">— keins —</option>
                                {imageOptions.map((im) => (
                                    <option key={im.link} value={im.link}>{im.label}{im.source === 'upload' ? ' (hochgeladen)' : ''}</option>
                                ))}
                            </select>
                        </label>
                    )}
                </div>
                <label className="an-check">
                    <input type="checkbox" name="ai_image" />
                    <span>diese Bilder als KI-Bild markieren (sonst wird KI automatisch aus den Metadaten erkannt)</span>
                </label>
                <button type="submit" className="an-btn-primary" disabled={imgPending}>
                    <FiUploadCloud aria-hidden="true" /> {imgPending ? 'Wird hinzugefügt…' : 'Bilder hinzufügen'}
                </button>
                {imgState?.error && <p className="an-form-error">{imgState.error}</p>}
            </form>

            {/* Video-Upload + Embed nebeneinander (je mit KI- & Autoplay-Wahl) */}
            <div className="an-field-row" style={{ marginBottom: 22, alignItems: 'flex-start' }}>
                <form action={vidAction} className="an-form an-checkgroup" style={{ margin: 0 }}>
                    <input type="hidden" name="project_id" value={projectId} />
                    <label className="an-field">
                        <span>Video hochladen <span className="an-muted">(MP4/WEBM, max. 25 MB)</span></span>
                        <input type="file" name="video" accept="video/mp4,video/webm" />
                    </label>
                    <label className="an-check"><input type="checkbox" name="autoplay" defaultChecked /><span>Autoplay (stumm)</span></label>
                    <label className="an-check"><input type="checkbox" name="ai_image" /><span>KI-Inhalt</span></label>
                    <button type="submit" className="an-btn-secondary an-btn-small" disabled={vidPending}>
                        <FiVideo aria-hidden="true" /> {vidPending ? 'Wird hochgeladen…' : 'Video hinzufügen'}
                    </button>
                    {vidState?.error && <p className="an-form-error">{vidState.error}</p>}
                </form>

                <form action={embAction} className="an-form an-checkgroup" style={{ margin: 0 }}>
                    <input type="hidden" name="project_id" value={projectId} />
                    <label className="an-field">
                        <span>Video einbetten <span className="an-muted">(DSGVO: lädt erst beim Klick)</span></span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <select name="embed_provider" defaultValue="youtube" style={{ flex: '0 0 120px' }}>
                                <option value="youtube">YouTube</option>
                                <option value="vimeo">Vimeo</option>
                            </select>
                            <input name="embed_id" placeholder="Video-ID (z. B. aqz-KE-bpKQ) oder Link" style={{ flex: '1 1 auto', minWidth: 0 }} />
                        </div>
                    </label>
                    <label className="an-check"><input type="checkbox" name="autoplay" defaultChecked /><span>Autoplay (stumm)</span></label>
                    <label className="an-check"><input type="checkbox" name="ai_image" /><span>KI-Inhalt</span></label>
                    <button type="submit" className="an-btn-secondary an-btn-small" disabled={embPending}>
                        <FiLink aria-hidden="true" /> {embPending ? 'Wird geprüft…' : 'Embed hinzufügen'}
                    </button>
                    {embState?.error && <p className="an-form-error">{embState.error}</p>}
                </form>
            </div>

            {/* Liste + Drag-Sortierung (erstes Item = Hero) */}
            {list.length === 0 ? (
                <p className="an-empty">Noch keine Medien. Oben hinzufügen — das erste Element ist das Hero-Medium.</p>
            ) : !mounted ? (
                <ul className="an-stationlist">
                    {list.map((img) => <StaticItem key={img.id} {...itemProps(img)} />)}
                </ul>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={list.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        <ul className="an-stationlist">
                            {list.map((img) => <SortableItem key={img.id} {...itemProps(img)} />)}
                        </ul>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
