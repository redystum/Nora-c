import {
    Play,
    Settings,
    TerminalSquare,
    Circle,
    FolderOpen,
} from 'lucide-preact';
import logo from '../../assets/logo.png';
import {useAppContext} from "../../AppContext";
import {Project} from "../../components/openProjetcModal";


interface HeaderProps {
    isSaved: boolean;
    isConsoleOpen: boolean;
    setIsConsoleOpen: (open: boolean) => void;
    project?: Project;
}

export function Header({ isSaved, isConsoleOpen, setIsConsoleOpen, project }: HeaderProps){

    const {openOpenProjectModal} = useAppContext()

    return (
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
                    onClick={() => openOpenProjectModal()}
                    className="cursor-pointer p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
                    title="Open Project"
                >
                    <FolderOpen size={18} />
                </button>

                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-neutral-100 font-medium tracking-tight">{ project?.name }</span>
                    <span
                        className="focus:outline-none ml-1 transition-transform hover:scale-110"
                        title={isSaved ? "Saved" : "Unsaved changes"}
                    >
                        {!isSaved &&
                            <Circle size={10} className="text-neutral-400 fill-neutral-400"/>
                        }
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                    className={`cursor-pointer p-2 rounded-lg transition-all duration-200 ${
                        isConsoleOpen
                            ? 'bg-neutral-800 text-neutral-100 shadow-inner shadow-black/50'
                            : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'
                    }`}
                    title="Toggle Console"
                >
                    <TerminalSquare size={18} strokeWidth={2}/>
                </button>

                <button
                    className="cursor-pointer p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 rounded-lg transition-colors"
                    title="Settings"
                >
                    <Settings size={18} strokeWidth={2}/>
                </button>

                <div className="w-px h-5 bg-neutral-800 mx-1 rounded-full"></div>

                <button
                    className="cursor-pointer group flex items-center gap-1.5 px-4 py-1.5 ml-1 bg-neutral-100 hover:bg-white text-neutral-950 rounded-lg text-xs font-bold transition-all active:scale-95 ]"
                    title="Run Code"
                >
                    <Play size={14} strokeWidth={3}
                          className="fill-neutral-950 transition-transform group-hover:translate-x-0.5"/>
                    RUN
                </button>
            </div>
        </header>
    );
}