import {useState} from 'preact/hooks';
import {MonacoEditor} from '../components/MonacoEditor';
import {
    Play,
    Settings,
    TerminalSquare,
    X,
    CheckCircle2,
    Circle,
    FolderCode,
    ChevronRight,
    Sparkles,
    FolderOpen // Added FolderOpen icon
} from 'lucide-preact';
import logo from '../assets/logo.png';

export function Home() {
    const [explorerWidth, setExplorerWidth] = useState<number>(260);
    const [consoleHeight, setConsoleHeight] = useState<number>(250);
    const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(true);
    const [isSaved, setIsSaved] = useState<boolean>(false);

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

            {/* FLOATING TOP BAR */}
            <header
                className="flex items-center justify-between px-4 h-14 bg-neutral-900 border border-neutral-800/80 rounded-xl shadow-lg shadow-black/40 shrink-0 select-none">
                <div className="flex items-center gap-4">
                    {/* Workspace Brand / Logo - Flat color now */}
                    <div className="flex items-center justify-center w-8 h-8">
                        <img src={logo} alt="Logo"/>
                    </div>

                    <div className="h-4 w-px bg-neutral-800"></div>

                    {/* Open Project Button */}
                    <button
                        // onClick={() => setIsProjectModalOpen(true)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
                        title="Open Project"
                    >
                        <FolderOpen size={18} />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-neutral-100 font-medium tracking-tight">main.c</span>
                        <button
                            onClick={() => setIsSaved(!isSaved)}
                            className="focus:outline-none ml-1 transition-transform hover:scale-110"
                            title={isSaved ? "Saved" : "Unsaved changes"}
                        >
                            {isSaved ? (
                                <CheckCircle2 size={10} className="text-neutral-500"/>
                            ) : (
                                <Circle size={10} className="text-neutral-400 fill-neutral-400"/>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                            isConsoleOpen
                                ? 'bg-neutral-800 text-neutral-100 shadow-inner shadow-black/50'
                                : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'
                        }`}
                        title="Toggle Console"
                    >
                        <TerminalSquare size={18} strokeWidth={2}/>
                    </button>

                    <div className="w-px h-5 bg-neutral-800 mx-1 rounded-full"></div>

                    <button
                        className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 rounded-lg transition-colors"
                        title="Settings"
                    >
                        <Settings size={18} strokeWidth={2}/>
                    </button>

                    {/* Glowing Run Button */}
                    <button
                        className="group flex items-center gap-1.5 px-4 py-1.5 ml-1 bg-neutral-100 hover:bg-white text-neutral-950 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        title="Run Code"
                    >
                        <Play size={14} strokeWidth={3}
                              className="fill-neutral-950 transition-transform group-hover:translate-x-0.5"/>
                        RUN
                    </button>
                </div>
            </header>

            {/* MAIN WORKSPACE */}
            <div className="flex flex-1 overflow-hidden">

                {/* FLOATING LEFT PANE: Explorer */}
                <div
                    style={{width: `${explorerWidth}px`}}
                    className="bg-neutral-900 border border-neutral-800/80 rounded-xl shadow-lg shadow-black/40 flex flex-col shrink-0 overflow-hidden select-none"
                >
                    <div
                        className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800/60 bg-neutral-900 text-neutral-400">
                        <FolderCode size={16} className="text-neutral-500"/>
                        <span className="text-xs font-bold uppercase tracking-widest">Explorer</span>
                    </div>
                    <div className={`flex-1 p-3 text-sm text-neutral-500 font-mono overflow-auto ${scrollbarClasses}`}>
                        {/* Fake file tree for aesthetic preview */}
                        <div
                            className="flex items-center gap-2 px-2 py-1.5 rounded bg-neutral-800/50 text-neutral-200 cursor-pointer">
                            <Sparkles size={14} className="text-yellow-500"/>
                            <span>main.c</span>
                        </div>
                    </div>
                </div>

                {/* Vertical Resizer */}
                <div
                    className="w-3 flex justify-center items-center cursor-col-resize shrink-0 z-10 group"
                    onMouseDown={handleHorizontalResize}
                >
                    <div
                        className="w-1 h-12 bg-neutral-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-[0_0_10px_rgba(255,255,255,0.1)]"></div>
                </div>

                {/* RIGHT COLUMN: Editor & Console */}
                <div className="flex flex-col flex-1 overflow-hidden">

                    {/* FLOATING EDITOR */}
                    <div
                        className="flex flex-col flex-1 bg-neutral-900 border border-neutral-800/80 rounded-xl shadow-lg shadow-black/40 overflow-hidden relative">

                        {/* Editor Breadcrumb Bar */}
                        <div
                            className="flex items-center px-4 h-9 bg-neutral-900/50 border-b border-neutral-800/60 select-none text-xs font-mono text-neutral-500">
                            <span className="hover:text-neutral-300 cursor-pointer transition-colors">src</span>
                            <ChevronRight size={14} className="mx-1 opacity-50"/>
                            <span className="hover:text-neutral-300 cursor-pointer transition-colors">components</span>
                            <ChevronRight size={14} className="mx-1 opacity-50"/>
                            <span className="text-neutral-200">main.c</span>
                        </div>

                        {/* Editor Container */}
                        <div
                            className="absolute top-9 bottom-0 left-0 right-0 m-2 rounded-lg overflow-hidden bg-neutral-950 shadow-inner shadow-black">
                            <MonacoEditor/>
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

                    {/* FLOATING CONSOLE */}
                    {isConsoleOpen && (
                        <div
                            style={{height: `${consoleHeight}px`}}
                            className="bg-neutral-900 border border-neutral-800/80 rounded-xl shadow-lg shadow-black/40 flex flex-col shrink-0 overflow-hidden"
                        >
                            <div
                                className="flex items-center justify-between px-4 h-10 border-b border-neutral-800/60 bg-neutral-900 select-none">
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <TerminalSquare size={14}/>
                                    <span className="text-xs font-bold uppercase tracking-widest">Console</span>
                                </div>
                                <button
                                    onClick={() => setIsConsoleOpen(false)}
                                    className="p-1 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/80 rounded-md transition-all active:scale-95"
                                >
                                    <X size={16} strokeWidth={2.5}/>
                                </button>
                            </div>
                            <div
                                className={`flex-1 p-4 font-mono text-sm text-neutral-300 overflow-auto bg-neutral-950/40 shadow-inner shadow-black/20 ${scrollbarClasses}`}>
                                <p className="text-neutral-500">~ System initialized.</p>
                                <p className="text-green-400/80 mt-1">➜ <span className="text-neutral-300">Ready for
                                    output...</span></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}