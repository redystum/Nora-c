import {
    FolderTree, FolderX,
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
    const {backendURL} = useAppContext();

    useEffect(() => {
        if (project == null) return;

        fetch(`${backendURL}/project/files?projectName=${project?.name}`)
            .then((response) => {
                if (!response.ok) {
                    console.error(response);
                    return
                }
                return response.json();
            })
            .then((data: ProjectTree) => {
                console.log('Project files:', data);
                setProjectTree(data);
            }).catch((err) => {
                console.error('Error fetching project files:', err);
            });
    }, [project]);

    return (
        <div
            style={{width: `${explorerWidth}px`}}
            className="bg-neutral-900 border border-neutral-800/80 rounded-xl shadow-lg shadow-black/40 flex flex-col shrink-0 overflow-hidden select-none"
        >
            <div
                className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/60 bg-neutral-900 text-neutral-400">
                <FolderTree size={16} className="text-neutral-500"/>
                <span className="text-xs font-bold uppercase tracking-widest">Project</span>
            </div>
            <div className={`flex-1 p-3 text-sm text-neutral-500 font-mono overflow-auto ${scrollbarClasses}`}>
                {!projectTree ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <LoadingElement text={"Loading project files..."} />
                    </div>
                ) : (
                    Object.keys(projectTree).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <FolderX size={48} className="text-neutral-700"/>
                            <span>No files found in this project.</span>
                        </div>
                    ) : (
                        <ProjectTreeView projectTree={projectTree} />
                    )
                )}
            </div>
        </div>
    );
}