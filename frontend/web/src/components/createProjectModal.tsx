import {X, FolderPlus} from 'lucide-preact';
import { useState } from 'preact/hooks';

interface CreateProjectData {
    name: string;
    description: string;
}

interface CreateProjectModalProps {
    isOpen: boolean;
    onBack: () => void;
    onCreate: (data: CreateProjectData) => void;
}

export function CreateProjectModal({ isOpen, onBack, onCreate }: CreateProjectModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate({ name, description });
            setName('');
            setDescription('');
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300"
        >
            <div className="w-full max-w-lg bg-[#0F0F0F] border border-neutral-800 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0 bg-[#141414]">
                    <h2 className="text-lg font-semibold text-neutral-200 flex items-center gap-2.5">
                        <div className="p-1.5 bg-neutral-800/50 rounded-lg">
                            <FolderPlus className="w-4 h-4 text-neutral-300" />
                        </div>
                        New Project
                    </h2>
                    <button
                        onClick={onBack}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-white/5 transition-all"
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Project Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onInput={(e) => setName(e.currentTarget.value)}
                                className="w-full bg-[#1A1A1A] border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-neutral-700 focus:bg-[#202020] focus:ring-1 focus:ring-neutral-700 transition-all placeholder:text-neutral-600 text-sm"
                                placeholder="e.g. My Awesome Project"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Description <span className="text-neutral-600 normal-case tracking-normal font-normal opacity-70">(Optional)</span></label>
                            <textarea
                                value={description}
                                onInput={(e) => setDescription(e.currentTarget.value)}
                                className="w-full bg-[#1A1A1A] border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-neutral-700 focus:bg-[#202020] focus:ring-1 focus:ring-neutral-700 transition-all placeholder:text-neutral-600 text-sm min-h-25 resize-none"
                                placeholder="Briefly describe what this project is about..."
                            />
                        </div>
                    </div>

                    <div className="px-5 py-4 border-t border-white/5 bg-[#141414] flex justify-end gap-3">
                         <button
                            type="button"
                            onClick={onBack}
                            className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/5 rounded-lg transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="px-4 py-2 text-sm font-semibold bg-neutral-100 hover:bg-white text-neutral-950 rounded-lg transition-all active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
