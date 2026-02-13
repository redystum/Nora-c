import {ProjectTree} from "../pages/sections/Explorer";

export function ProjectTreeView({projectTree}: { projectTree: ProjectTree }) {
    return (
        <ul className="space-y-1">
            {Object.entries(projectTree).map(([folder, files]) => (
                <li key={folder}>
                    <div className="flex items-center gap-2">
                        <span className="text-neutral-500">{folder}</span>
                    </div>
                    <ul className="ml-4 mt-1 space-y-1">
                        {!files || files.length === 0 ? (
                            <li className="text-neutral-600 italic">No files in this folder.</li>
                        ) : (
                            files.map((file) => (
                                <li key={file.name} className="flex items-center gap-2">
                                    <span className={`text-sm ${file.isFolder ? 'text-neutral-500' : 'text-neutral-300'}`}>
                                        {file.name}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </li>
            ))}
        </ul>
    );
}