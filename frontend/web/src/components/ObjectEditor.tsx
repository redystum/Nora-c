import { useState } from 'react';
import {ArrowDown, ArrowUp, Crosshair, GripVertical, MousePointerSquareDashed} from 'lucide-preact';
import {Project} from "./openProjetcModal";

const SELECTOR_TYPES = [
    { type: 'CSS_SELECTOR', label: 'CSS Selector' },
    { type: 'LINK_TEXT_SELECTOR', label: 'Link Text' },
    { type: 'PARTIAL_LINK_TEXT_SELECTOR', label: 'Partial Link Text' },
    { type: 'TAG_NAME', label: 'Tag Name' },
    { type: 'XPATH_SELECTOR', label: 'XPath' }
];

interface ObjectEditorProps {
    isSavedCallBack: (saved: boolean) => void;
    file?: string;
    project?: Project;
}

export function ObjectEditor({isSavedCallBack, file, project}: ObjectEditorProps) {
    const [selectors, setSelectors] = useState(
        SELECTOR_TYPES.map(s => ({ ...s, value: '' }))
    );
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const newSelectors = [...selectors];
            [newSelectors[index - 1], newSelectors[index]] = [newSelectors[index], newSelectors[index - 1]];
            setSelectors(newSelectors);
            isSavedCallBack(false);
        } else if (direction === 'down' && index < selectors.length - 1) {
            const newSelectors = [...selectors];
            [newSelectors[index + 1], newSelectors[index]] = [newSelectors[index], newSelectors[index + 1]];
            setSelectors(newSelectors);
            isSavedCallBack(false);
        }
    };

    const moveItemByDrag = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        const newSelectors = [...selectors];
        const [dragged] = newSelectors.splice(fromIndex, 1);
        newSelectors.splice(toIndex, 0, dragged);
        setSelectors(newSelectors);
        isSavedCallBack(false);
    };

    const updateValue = (index: number, value: string) => {
        const newSelectors = [...selectors];
        newSelectors[index].value = value;
        setSelectors(newSelectors);
        isSavedCallBack(false);
    };

    return (
        <section className="flex h-full min-h-0 w-full flex-col">
            <header className="shrink-0 border-b border-white/5 px-4 py-3">
                <div className="flex items-center gap-2 text-neutral-200">
                    <div className="rounded-lg border border-neutral-800 p-1.5">
                        <MousePointerSquareDashed size={14} />
                    </div>
                    <h3 className="text-sm font-semibold">Web Element Identifier</h3>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
                    Fill multiple selectors and reorder by fallback priority. Drag cards or use arrows to change order.
                </p>
            </header>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                {selectors.map((selector, index) => {
                    const isDragging = draggingIndex === index;
                    const isDropTarget = dragOverIndex === index && draggingIndex !== index;

                    return (
                        <div
                            key={selector.type}
                            draggable
                            onDragStart={() => {
                                setDraggingIndex(index);
                                setDragOverIndex(index);
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (dragOverIndex !== index) setDragOverIndex(index);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggingIndex !== null) moveItemByDrag(draggingIndex, index);
                                setDraggingIndex(null);
                                setDragOverIndex(null);
                            }}
                            onDragEnd={() => {
                                setDraggingIndex(null);
                                setDragOverIndex(null);
                            }}
                            className={`group flex items-center gap-3 rounded-lg border px-3 py-2 transition-all ${isDragging ? 'border-sky-600/70 bg-sky-950/20 opacity-80' : 'border-neutral-800 bg-[#151515] hover:border-neutral-700 hover:bg-[#1A1A1A]'} ${isDropTarget ? 'ring-1 ring-sky-500/60' : ''}`}
                        >
                            <div className="flex items-center gap-2 text-neutral-500">
                                <button
                                    type="button"
                                    className="cursor-grab active:cursor-grabbing inline-flex h-6 w-6 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 text-neutral-400"
                                    aria-label={`Drag ${selector.label}`}
                                >
                                    <GripVertical size={13} />
                                </button>
                                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 px-1 text-[10px] font-semibold text-neutral-300">
                                    {index + 1}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    className="cursor-pointer inline-flex h-6 w-6 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                                    onClick={() => moveItem(index, 'up')}
                                    disabled={index === 0}
                                    aria-label={`Move ${selector.label} up`}
                                >
                                    <ArrowUp size={12} />
                                </button>
                                <button
                                    type="button"
                                    className="cursor-pointer inline-flex h-6 w-6 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                                    onClick={() => moveItem(index, 'down')}
                                    disabled={index === selectors.length - 1}
                                    aria-label={`Move ${selector.label} down`}
                                >
                                    <ArrowDown size={12} />
                                </button>
                            </div>

                            <label className="flex min-w-0 flex-1 items-center gap-3">
                                <span className="w-40 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-neutral-300">
                                    {selector.label}
                                </span>
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-neutral-700 bg-[#0F0F0F] px-3 py-1.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-sky-500/70 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                                    value={selector.value}
                                    onChange={(e) => updateValue(index, e.currentTarget.value)}
                                    placeholder={`Enter ${selector.label}...`}
                                />
                            </label>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
