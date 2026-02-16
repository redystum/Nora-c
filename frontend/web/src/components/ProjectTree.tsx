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
    Trash2,
    FolderRoot
} from "lucide-preact";
import {FILE_TYPES} from "./CreateFileOrFolder";

interface ProjectTreeViewProps {
    projectTree: ProjectTree;
    project?: Project;
    onReload?: () => void;
    onSelectFile: (filePath: string) => void;
}

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    path: string;
    isFolder: boolean;
}

export function ProjectTreeView({projectTree, project, onReload, onSelectFile}: ProjectTreeViewProps) {
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
    const {backendURL, showError, setIsCreateFileOrFolderModalOpen} = useAppContext();

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

                const response = await fetch(`${backendURL}/projects/files/delete`, {
                    method: 'POST',
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
                if (onReload) onReload();
            } else {
                const callback = async (name: string, lang: string) => {
                    console.log('name', name, 'lang', lang);
                    if (!name) return;
                    name = name.trim();
                    name = name.replace(/[/\\?%*:|"<>]/g, '_');

                    FILE_TYPES.map((file, _) => {
                        if (!!file.endsWith && file.id === lang) {
                            if (!name.endsWith(file.endsWith)) {
                                name += file.endsWith
                            }
                        }
                    });

                    // Simple path construction. Note: path could be empty for root if we supported root context menu
                    const newPath = path ? `${path}/${name}` : name;

                    let url = '';
                    if (action === 'create-file') {
                        url = `${backendURL}/files`;
                    } else if (action === 'create-folder') {
                        url = `${backendURL}/folders`;
                    }
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            projectName: project.name,
                            path: newPath,
                        })
                    });
                    if (!response.ok) {
                        const err = await response.json().catch(() => ({}));
                        throw new Error(err.error || 'Failed to create');
                    }

                    if (onReload) onReload();
                };

                setIsCreateFileOrFolderModalOpen({
                    type: action === 'create-file' ? 'file' : 'folder',
                    path,
                    callback
                });
            }
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
                        onSelectFile={onSelectFile}
                    />
                ))}
            </ul>
            {contextMenu && contextMenu.visible && (
                <div
                    className="fixed bg-neutral-900 border border-neutral-800 shadow-xl rounded-lg py-1 z-50 min-w-40"
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

function FolderNode({name, files, path, onContextMenu, onSelectFile}: {
    name: string,
    files: ProjectFile[],
    path: string,
    onContextMenu: (e: MouseEvent, p: string, f: boolean) => void
    onSelectFile: (filePath: string) => void
}) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <li>
            <div
                className="flex items-center gap-2 hover:bg-neutral-800/50 rounded px-2 py-1 cursor-pointer select-none group"
                onClick={() => setIsOpen(!isOpen)}
                onContextMenu={(e) => onContextMenu(e, path, true)}
            >
                <span className="text-neutral-200 group-hover:text-neutral-100 transition-colors">
                    {isOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                </span>
                <FolderRoot size={14}
                            className="shrink-0 text-neutral-200 group-hover:text-neutral-100 transition-colors"/>
                <span
                    className="text-neutral-200 font-medium text-sm group-hover:text-neutral-100 transition-colors">{name}</span>
            </div>
            {isOpen && (
                <ul className="ml-2 pl-2 border-l border-neutral-800/50 space-y-0.5 mt-0.5">
                    {files.length === 0 ? (
                        <li className="text-neutral-600 text-xs italic pl-6 py-1">Empty folder</li>
                    ) : (
                        files.map(file => (
                            <FileNode key={file.name} file={file} parentPath={path} onContextMenu={onContextMenu}
                                      onSelectFile={onSelectFile}/>
                        ))
                    )}
                </ul>
            )}
        </li>
    )
}

function FileNode({file, parentPath, onContextMenu, onSelectFile}: {
    file: ProjectFile,
    parentPath: string,
    onContextMenu: (e: MouseEvent, p: string, f: boolean) => void,
    onSelectFile: (filePath: string) => void
}) {
    const [isOpen, setIsOpen] = useState(false);
    const currentPath = `${parentPath}/${file.name}`;
    const [fileType, setFileType] = useState(FILE_TYPES[0]);

    setFileType(FILE_TYPES.find(type => {
        if (type.endsWith) {
            return file.name.endsWith(type.endsWith);
        }
        return file.name.split('.').pop() === type.id;
    }));

    useEffect(() => {
        console.log(fileType);
    }, [fileType]);

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
                    <Folder size={14}
                            className="shrink-0 text-blue-400/80 group-hover:text-blue-400 transition-colors"/>
                    <span
                        className="text-neutral-400 text-sm group-hover:text-neutral-300 transition-colors">{file.name}</span>
                </div>
                {isOpen && (
                    file.children && file.children.length > 0 ? (
                        <ul className="ml-2 pl-2 border-l border-neutral-800/50 space-y-0.5">
                            {file.children.map(child => (
                                <FileNode key={child.name} file={child} parentPath={currentPath}
                                          onContextMenu={onContextMenu} onSelectFile={onSelectFile}/>
                            ))}
                        </ul>
                    ) : (
                        <ul className="ml-2 pl-2 border-l border-neutral-800/50 space-y-0.5">
                            <li className="text-neutral-600 text-xs italic pl-6 py-1">Empty folder</li>
                        </ul>
                    )
                )}
            </li>
        )
    }

    return (
        <li
            className="flex items-center gap-2 hover:bg-neutral-800/50 rounded px-2 py-1 cursor-pointer select-none ml-4 group"
            onContextMenu={(e) => onContextMenu(e, currentPath, false)}
            onClick={() => onSelectFile(currentPath)}
        >
            {fileType && fileType.icon ? (
                <fileType.icon size={14}
                               className="shrink-0 text-neutral-500 group-hover:text-neutral-400 transition-colors"/>
            ) : (
                <FileIcon size={14}
                          className="shrink-0 text-neutral-500 group-hover:text-neutral-400 transition-colors"/>
            )}
            <span className="text-neutral-400 text-sm group-hover:text-neutral-300 transition-colors">{file.name}</span>
        </li>
    )
}