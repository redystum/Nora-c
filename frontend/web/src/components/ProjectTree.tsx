import {ProjectFile, ProjectTree} from "../pages/sections/Explorer";
import {useState, useEffect} from "preact/hooks";
import {Project} from "./openProjetcModal";
import {useAppContext} from "../AppContext";
import {
    ChevronDown,
    ChevronRight,
    File as FileIcon,
    FilePlus,
    Folder,
    FolderPlus,
    Trash2
} from "lucide-preact";

interface ProjectTreeViewProps {
    projectTree: ProjectTree;
    project?: Project;
    onReload?: () => void;
}

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    path: string;
    isFolder: boolean;
}

export function ProjectTreeView({projectTree, project, onReload}: ProjectTreeViewProps) {
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
    const {backendURL, showError} = useAppContext();

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleContextMenu = (e: MouseEvent, path: string, isFolder: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            path,
            isFolder
        });
    };

    const handleAction = async (action: 'create-file' | 'create-folder' | 'delete') => {
        if (!project || !contextMenu || !backendURL) return;

        const {path, isFolder} = contextMenu;

        try {
            if (action === 'delete') {
                if (!confirm(`Are you sure you want to delete ${path}?`)) return;

                const response = await fetch(`${backendURL}/projects/files`, {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        projectName: project.name,
                        path: path
                    })
                });
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.error || 'Failed to delete');
                }
            } else {
                const name = prompt(`Enter name for new ${action === 'create-file' ? 'file' : 'folder'}:`);
                if (!name) return;

                // Simple path construction. Note: path could be empty for root if we supported root context menu
                const newPath = path ? `${path}/${name}` : name;

                const response = await fetch(`${backendURL}/projects/files`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        projectName: project.name,
                        path: newPath,
                        isFolder: action === 'create-folder'
                    })
                });
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.error || 'Failed to create');
                }
            }
            if (onReload) onReload();
        } catch (e: any) {
            console.error(e);
            showError(e.message);
        }
        setContextMenu(null);
    };

    return (
        <div className="h-full relative">
            <ul className="space-y-1 pb-10">
                {Object.entries(projectTree).map(([folderName, files]) => (
                    <FolderNode
                        key={folderName}
                        name={folderName}
                        files={files}
                        path={folderName}
                        onContextMenu={handleContextMenu}
                    />
                ))}
            </ul>
            {contextMenu && contextMenu.visible && (
                <div
                    className="fixed bg-neutral-900 border border-neutral-800 shadow-xl rounded-lg py-1 z-50 min-w-[160px]"
                    style={{top: contextMenu.y, left: contextMenu.x}}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.isFolder && (
                        <>
                            <button
                                className="w-full text-left px-3 py-2 hover:bg-neutral-800 text-xs text-neutral-300 flex items-center gap-2 transition-colors"
                                onClick={() => handleAction('create-file')}>
                                <FilePlus size={14} className="text-neutral-400"/> New File
                            </button>
                            <button
                                className="w-full text-left px-3 py-2 hover:bg-neutral-800 text-xs text-neutral-300 flex items-center gap-2 transition-colors"
                                onClick={() => handleAction('create-folder')}>
                                <FolderPlus size={14} className="text-neutral-400"/> New Folder
                            </button>
                            <div className="h-px bg-neutral-800 my-1 mx-2"/>
                        </>
                    )}

                    <button
                        className="w-full text-left px-3 py-2 hover:bg-red-900/20 text-xs text-red-400 flex items-center gap-2 transition-colors"
                        onClick={() => handleAction('delete')}>
                        <Trash2 size={14}/> Delete
                    </button>
                </div>
            )}
        </div>
    );
}

function FolderNode({name, files, path, onContextMenu}: {
    name: string,
    files: ProjectFile[],
    path: string,
    onContextMenu: (e: MouseEvent, p: string, f: boolean) => void
}) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <li>
            <div
                className="flex items-center gap-2 hover:bg-neutral-800/50 rounded px-2 py-1 cursor-pointer select-none group"
                onClick={() => setIsOpen(!isOpen)}
                onContextMenu={(e) => onContextMenu(e, path, true)}
            >
                <span className="text-neutral-500 group-hover:text-neutral-400 transition-colors">
                     {isOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                </span>
                <span className="text-neutral-400 font-medium text-sm group-hover:text-neutral-200 transition-colors">{name}</span>
            </div>
            {isOpen && (
                <ul className="ml-2 pl-2 border-l border-neutral-800/50 space-y-0.5 mt-0.5">
                    {files.length === 0 ? (
                        <li className="text-neutral-600 text-xs italic pl-6 py-1">Empty folder</li>
                    ) : (
                        files.map(file => (
                            <FileNode key={file.name} file={file} parentPath={path} onContextMenu={onContextMenu}/>
                        ))
                    )}
                </ul>
            )}
        </li>
    )
}

function FileNode({file, parentPath, onContextMenu}: {
    file: ProjectFile,
    parentPath: string,
    onContextMenu: (e: MouseEvent, p: string, f: boolean) => void
}) {
    const [isOpen, setIsOpen] = useState(false);
    const currentPath = `${parentPath}/${file.name}`;
    const [isHovered, setIsHovered] = useState(false);

    if (file.isFolder) {
        return (
            <li>
                <div
                    className="flex items-center gap-2 hover:bg-neutral-800/50 rounded px-2 py-1 cursor-pointer select-none group"
                    onClick={() => setIsOpen(!isOpen)}
                    onContextMenu={(e) => onContextMenu(e, currentPath, true)}
                >
                     <span className="text-neutral-500 group-hover:text-neutral-400 transition-colors">
                        {isOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                    </span>
                    <Folder size={14} className="text-blue-400/80 group-hover:text-blue-400 transition-colors"/>
                    <span className="text-neutral-400 text-sm group-hover:text-neutral-300 transition-colors">{file.name}</span>
                </div>
                {isOpen && file.children && (
                    <ul className="ml-2 pl-2 border-l border-neutral-800/50 space-y-0.5">
                        {file.children.map(child => (
                            <FileNode key={child.name} file={child} parentPath={currentPath}
                                      onContextMenu={onContextMenu}/>
                        ))}
                    </ul>
                )}
            </li>
        )
    }

    return (
        <li
            className="flex items-center gap-2 hover:bg-neutral-800/50 rounded px-2 py-1 cursor-pointer select-none ml-4 group"
            onContextMenu={(e) => onContextMenu(e, currentPath, false)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <FileIcon size={14} className="text-neutral-500 group-hover:text-neutral-400 transition-colors"/>
            <span className="text-neutral-400 text-sm group-hover:text-neutral-300 transition-colors">{file.name}</span>
        </li>
    )
}