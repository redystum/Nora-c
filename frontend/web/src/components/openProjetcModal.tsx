import { Folder, Calendar, Search, Plus} from 'lucide-preact';
import { useEffect, useState, useMemo } from 'preact/hooks';

export interface Project {
    name: string;
    description: string | null;
    created_at: string;
}

interface OpenProjectModalProps {
    isOpen: boolean;
    onSelect: (project: Project) => void;
    onNewProject: () => void;
}

export function OpenProjectModal({ isOpen, onSelect, onNewProject }: OpenProjectModalProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    useEffect(() => {
        // Mock data for now
        setProjects([
            {
                name: 'My C Project',
                description: 'A simple C project for testing',
                created_at: '2023-10-27T10:00:00Z',
            },
            {
                name: 'Data Structures',
                description: null,
                created_at: '2023-11-05T14:30:00Z',
            },
            {
                name: 'Algorithm Wiki',
                description: 'Collection of algorithms implemented in C',
                created_at: '2023-12-12T09:15:00Z',
            }
        ]);
    }, []);

    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return projects;

        const lowerQuery = searchQuery.toLowerCase();

        return projects
            .filter((project) => {
                const nameMatch = project.name.toLowerCase().includes(lowerQuery);
                const descMatch = project.description?.toLowerCase().includes(lowerQuery);
                return nameMatch || descMatch;
            })
            .sort((a, b) => {
                const aNameMatch = a.name.toLowerCase().includes(lowerQuery);
                const bNameMatch = b.name.toLowerCase().includes(lowerQuery);

                // Prioritize name matches
                if (aNameMatch && !bNameMatch) return -1;
                if (!aNameMatch && bNameMatch) return 1;
                return 0;
            });
    }, [projects, searchQuery]);

    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300"
        >
            <div className="w-full max-w-lg bg-[#0F0F0F] border border-neutral-800 rounded-2xl shadow-2xl shadow-black/50 flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0 bg-[#141414]">
                    <h2 className="text-lg font-semibold text-neutral-200 flex items-center gap-2.5">
                        <div className="p-1.5 bg-neutral-800/50 rounded-lg">
                            <Folder className="w-4 h-4 text-neutral-300" />
                        </div>
                        Open Project
                    </h2>
                    <div className="flex gap-2">
                         <button
                            onClick={onNewProject}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 transition-all"
                            title="Create New Project"
                        >
                            <Plus size={14} />
                            <span>New</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-white/5 bg-[#0F0F0F]">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-neutral-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search projects by name or description..."
                            value={searchQuery}
                            onInput={(e) => setSearchQuery(e.currentTarget.value)}
                            className="w-full bg-[#1A1A1A] border border-neutral-800 text-neutral-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-neutral-700 focus:bg-[#202020] focus:ring-1 focus:ring-neutral-700 transition-all placeholder:text-neutral-600"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Project List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                    {filteredProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
                            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-sm font-medium">No projects found</p>
                            <p className="text-xs opacity-60 mt-1">Try searching for something else</p>
                        </div>
                    ) : (
                        filteredProjects.map((project) => (
                            <button
                                key={project.name}
                                onClick={() => onSelect(project)}
                                className="w-full text-left p-3.5 rounded-xl hover:bg-neutral-800/50 border border-transparent hover:border-neutral-800/80 transition-all group flex gap-4 items-start"
                            >
                                <div className="mt-1 p-2 bg-neutral-900 rounded-lg group-hover:bg-neutral-800 transition-colors text-neutral-500 group-hover:text-neutral-300 border border-neutral-800">
                                    <Folder size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <span className="font-semibold text-neutral-300 group-hover:text-white transition-colors truncate pr-2">
                                            {project.name}
                                        </span>
                                        <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 shrink-0">
                                            <Calendar size={10} />
                                            {formatDate(project.created_at)}
                                        </span>
                                    </div>
                                    {project.description ? (
                                        <p className="text-xs text-neutral-500 line-clamp-1 group-hover:text-neutral-400 font-medium">
                                            {project.description}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-neutral-600 italic">No description</p>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer status line */}
                <div className="px-4 py-2 border-t border-white/5 bg-[#141414] text-[10px] text-neutral-500 flex justify-between items-center">
                    <span>{filteredProjects.length} projects</span>
                </div>
            </div>
        </div>
    );
}
