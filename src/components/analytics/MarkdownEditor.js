'use client';

import { useRef, useState } from 'react';
import Markdown from '@/components/blog/Markdown';
import styles from './markdowneditor.module.css';

// Leichtgewichtiger Markdown-Editor: Textarea + Toolbar + Live-Preview-Split.
// Bewusst kein schwerer WYSIWYG-Editor — der Body bleibt reiner Markdown-Text
// (diffbar, kein Lock-in), die Vorschau nutzt denselben Renderer wie das
// Frontend, sodass „was du siehst" exakt der späteren Ausgabe entspricht.

// Fügt Markup um die aktuelle Auswahl (oder am Cursor) ein.
function wrapSelection(el, before, after = before, placeholder = '') {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end) || placeholder;
    const next = el.value.slice(0, start) + before + selected + after + el.value.slice(end);
    const caret = start + before.length + selected.length;
    return { next, caret };
}

// Setzt ein Zeilen-Präfix (z. B. „## ", „- ") am Zeilenanfang der Auswahl.
function prefixLines(el, prefix) {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const lineStart = el.value.lastIndexOf('\n', start - 1) + 1;
    const block = el.value.slice(lineStart, end);
    const replaced = block.split('\n').map((l) => prefix + l).join('\n');
    const next = el.value.slice(0, lineStart) + replaced + el.value.slice(end);
    return { next, caret: end + (replaced.length - block.length) };
}

const TOOLBAR = [
    { label: 'H2', title: 'Überschrift', apply: (el) => prefixLines(el, '## ') },
    { label: 'H3', title: 'Unterüberschrift', apply: (el) => prefixLines(el, '### ') },
    { label: 'B', title: 'Fett', apply: (el) => wrapSelection(el, '**', '**', 'fett') },
    { label: 'I', title: 'Kursiv', apply: (el) => wrapSelection(el, '*', '*', 'kursiv') },
    { label: '• Liste', title: 'Aufzählung', apply: (el) => prefixLines(el, '- ') },
    { label: '1. Liste', title: 'Nummerierte Liste', apply: (el) => prefixLines(el, '1. ') },
    { label: '“ Zitat', title: 'Zitat', apply: (el) => prefixLines(el, '> ') },
    { label: '</> Code', title: 'Inline-Code', apply: (el) => wrapSelection(el, '`', '`', 'code') },
    { label: 'Codeblock', title: 'Codeblock', apply: (el) => wrapSelection(el, '```\n', '\n```', 'Code hier') },
    { label: '🔗 Link', title: 'Link', apply: (el) => wrapSelection(el, '[', '](https://)', 'Linktext') },
    { label: '🖼 Bild', title: 'Bild', apply: (el) => wrapSelection(el, '![', '](/media/bild.jpg)', 'Alt-Text') },
    { label: '⬛▤ Bild links', title: 'Bild links, Text rechts', apply: (el) => wrapSelection(el, ':::media-left\n![Alt-Text](/media/bild.jpg)\n\n', '\n:::', 'Text neben dem Bild …') },
    { label: '▤⬛ Bild rechts', title: 'Bild rechts, Text links', apply: (el) => wrapSelection(el, ':::media-right\n![Alt-Text](/media/bild.jpg)\n\n', '\n:::', 'Text neben dem Bild …') },
];

export default function MarkdownEditor({ name = 'body', defaultValue = '' }) {
    const ref = useRef(null);
    const [value, setValue] = useState(defaultValue);
    const [showPreview, setShowPreview] = useState(true);

    const run = (apply) => {
        const el = ref.current;
        if (!el) return;
        const { next, caret } = apply(el);
        setValue(next);
        // Cursor nach dem State-Update wiederherstellen.
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(caret, caret);
        });
    };

    return (
        <div className={styles.editor}>
            <div className={styles.toolbar}>
                {TOOLBAR.map((btn) => (
                    <button
                        key={btn.label}
                        type="button"
                        title={btn.title}
                        className={styles.tbBtn}
                        onClick={() => run(btn.apply)}
                    >
                        {btn.label}
                    </button>
                ))}
                <button
                    type="button"
                    className={`${styles.tbBtn} ${styles.tbToggle}`}
                    onClick={() => setShowPreview((s) => !s)}
                    title="Vorschau ein-/ausblenden"
                >
                    {showPreview ? 'Vorschau aus' : 'Vorschau an'}
                </button>
            </div>

            <div className={`${styles.split} ${showPreview ? '' : styles.noPreview}`}>
                <textarea
                    ref={ref}
                    name={name}
                    className={styles.textarea}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    spellCheck={false}
                    rows={20}
                    placeholder={'# Überschrift\n\nText in **Markdown** …'}
                />
                {showPreview && (
                    <div className={styles.preview}>
                        {value.trim()
                            ? <Markdown>{value}</Markdown>
                            : <p className={styles.previewEmpty}>Vorschau erscheint hier …</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
