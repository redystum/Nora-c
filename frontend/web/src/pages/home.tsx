import {useState} from 'preact/hooks';
import {MonacoEditor} from './sections/MonacoEditor';
import {Project} from "../components/openProjetcModal";
import {Header} from "./sections/Header";
import {Explorer} from "./sections/Explorer";
import {Console} from "./sections/Console";
import {ChevronRight, Circle} from 'lucide-preact';


export function Home({project}: { project?: Project }) {
    const [explorerWidth, setExplorerWidth] = useState<number>(260);
    const [consoleHeight, setConsoleHeight] = useState<number>(250);
    const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(true);
    const [isSaved, setIsSaved] = useState<boolean>(true);
    const [file, setFile] = useState<{ name: string; folder: string }>({name: 'main.c', folder: 'src'});

    const handleEditorOnSave = (saved: boolean) => {
        setIsSaved(saved);
    };

    const handleHorizontalResize = (e: MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = explorerWidth;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = startWidth + (moveEvent.clientX - startX);
            setExplorerWidth(Math.max(150, Math.min(newWidth, 600)));
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'default';
        };

        document.body.style.cursor = 'col-resize';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleVerticalResize = (e: MouseEvent) => {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = consoleHeight;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const newHeight = startHeight - (moveEvent.clientY - startY);
            if (newHeight < 100) {
                setIsConsoleOpen(false);
                return
            } else {
                setIsConsoleOpen(true);
            }
            setConsoleHeight(Math.max(100, Math.min(newHeight, 800)));
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'default';
        };

        document.body.style.cursor = 'row-resize';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };


    // Reusable custom scrollbar classes
    const scrollbarClasses = "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-800 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors";

    return (
        <div
            className="flex flex-col h-screen w-screen bg-neutral-950 text-neutral-300 font-sans overflow-hidden p-3 gap-3 selection:bg-neutral-700 selection:text-white">

            <Header
                isSaved={isSaved}
                isConsoleOpen={isConsoleOpen}
                setIsConsoleOpen={setIsConsoleOpen}
                project={project}
            />

            <div className="flex flex-1 overflow-hidden">

                <Explorer project={project} explorerWidth={explorerWidth} scrollbarClasses={scrollbarClasses}/>

                {/* Vertical Resizer */}
                <div
                    className="w-3 flex justify-center items-center cursor-col-resize shrink-0 z-10 group"
                    onMouseDown={handleHorizontalResize}
                >
                    <div
                        className="w-1 h-12 bg-neutral-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-[0_0_10px_rgba(255,255,255,0.1)]"></div>
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">

                    <div
                        className="flex flex-1 flex-col bg-neutral-900 border border-neutral-800/80 rounded-xl shadow-lg shadow-black/40 overflow-hidden relative">
                        <div
                            className="flex items-center px-4 h-9 bg-neutral-900/50 border-b border-neutral-800/60 select-none text-xs font-mono text-neutral-500">
                            <span className="hover:text-neutral-300 cursor-pointer transition-colors">{project?.name}</span>
                            <ChevronRight size={14} className="mx-1 opacity-50"/>
                            <span className="hover:text-neutral-300 cursor-pointer transition-colors">{file.folder}</span>
                            <ChevronRight size={14} className="mx-1 opacity-50"/>
                            <span className="text-neutral-200">{file.name}</span>
                            {!isSaved &&
                                <Circle size={10} className="text-neutral-400 fill-neutral-400"/>
                            }
                        </div>
                        
                        <div
                            className="absolute top-9 bottom-0 left-0 right-0 m-2 rounded-lg overflow-hidden bg-neutral-950 shadow-inner shadow-black">
                            <MonacoEditor isSavedCallBack={handleEditorOnSave}/>
                        </div>
                    </div>

                    {/* Horizontal Resizer */}
                    {isConsoleOpen && (
                        <div
                            className="h-3 flex justify-center items-center cursor-row-resize shrink-0 z-10 group"
                            onMouseDown={handleVerticalResize}
                        >
                            <div
                                className="h-1 w-12 bg-neutral-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-[0_0_10px_rgba(255,255,255,0.1)]"></div>
                        </div>
                    )}

                    {isConsoleOpen && (
                        <Console setIsConsoleOpen={setIsConsoleOpen} scrollbarClasses={scrollbarClasses}
                                 consoleHeight={consoleHeight}/>
                    )}
                </div>
            </div>
        </div>
    );
}