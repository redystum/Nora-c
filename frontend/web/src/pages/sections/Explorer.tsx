import {
    FolderTree, FolderX, RefreshCw,
} from 'lucide-preact';
import {Project} from "../../components/openProjetcModal";
import {useEffect, useState} from "preact/hooks";
import {useAppContext} from "../../AppContext";
import {ProjectTreeView} from "../../components/ProjectTree";
import {LoadingElement} from "../../components/LoadingElement";

interface ExplorerProps {
    explorerWidth: number;
    scrollbarClasses: string;
    project?: Project;
}

export interface ProjectFile {
    name: string;
    topParent: string;
    isFolder: boolean;
    children?: ProjectFile[];
}

export interface ProjectTree {
    [key: string]: ProjectFile[];
}

export function Explorer({explorerWidth, scrollbarClasses, project}: ExplorerProps) {
    const [projectTree, setProjectTree] = useState<ProjectTree | null>(null);
    const {backendURL, showError} = useAppContext();
    const [reload, setReload] = useState<number>(0);

    useEffect(() => {
        if (project == null) return;

        fetch(`${backendURL}/projects/files?projectName=${project?.name}`)
            .then(async (response) => {
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.error || `Failed to fetch files: ${response.statusText}`);
                }
                return response.json();
            })
            .then((data: ProjectTree) => {
                console.log('Project files:', data);
                setProjectTree(data);
            }).catch((err) => {
            console.error('Error fetching project files:', err);
            showError(err.message);
        });
    }, [project, reload]);

    return (
        <div
            style={{width: `${explorerWidth}px`}}
            className="bg-neutral-900 border border-neutral-800/80 rounded-xl shadow-lg shadow-black/40 flex flex-col shrink-0 overflow-hidden select-none"
        >
            <div
                className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/60 bg-neutral-900 text-neutral-400">
                <FolderTree size={16} className="text-neutral-500"/>
                <span className="text-xs font-bold uppercase tracking-widest">Project</span>
                <button onClick={() => setReload((prev) => prev + 1)}
                        className="ml-auto p-1 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/80 rounded-md transition-all active:scale-95"
                        title="Refresh File Tree">
                <RefreshCw size={14}/>
                </button>
            </div>
            <div className={`flex-1 p-3 text-sm text-neutral-500 font-mono overflow-auto ${scrollbarClasses}`}>
                {!projectTree ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <LoadingElement text={"Loading project files..."}/>
                    </div>
                ) : (
                    Object.keys(projectTree).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <FolderX size={48} className="text-neutral-700"/>
                            <span>No files found in this project.</span>
                        </div>
                    ) : (
                        <ProjectTreeView projectTree={projectTree} project={project} onReload={() => setReload(r => r + 1)}/>
                    )
                )}
            </div>
        </div>
    );
}