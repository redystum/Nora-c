import {TerminalSquare, X} from "lucide-preact";
import {useEffect, useRef, useState} from "preact/hooks";
import socket from "../../utils/socket";
import {useAppContext} from "../../AppContext";

type ConsoleLineType = "system" | "info" | "success" | "warning" | "error" | "code" | "code_error" | "end";
type statusType = "idle" | "error" | "connected" | "closed" | "disconnected"

interface ConsoleLine {
    text: string;
    type: ConsoleLineType;
}

interface ConsoleProps {
    consoleHeight: number;
    scrollbarClasses: string;
    setIsConsoleOpen: (open: boolean) => void;
}

export function Console({consoleHeight, scrollbarClasses, setIsConsoleOpen}: ConsoleProps) {
    const [lines, setLines] = useState<ConsoleLine[]>([]);
    const [status, setStatus] = useState<statusType>("idle");
    const containerRef = useRef<HTMLDivElement | null>(null);
    const {wsURL} = useAppContext();

    const appendLine = (line: ConsoleLine) => setLines(prev => [...prev, line]);

    // Hook for "end" messages. Replace internals if you want custom app behavior.
    const ExampleCall = () => {
        window.dispatchEvent(new CustomEvent("nora:run-ended"));
        console.log("ExampleCall executed on end message.");
    };

    const toConsoleLine = (msg: any): ConsoleLine => {
        if (msg?.__socket_error) {
            return {text: "[socket error]", type: "error"};
        }

        if (msg?.__socket_closed) {
            return {text: `[socket closed: ${msg.code}]`, type: "warning"};
        }

        if (typeof msg === "string") {
            return {text: msg, type: "info"};
        }

        if (msg && typeof msg === "object") {
            const rawType = String(msg.type ?? "info").toLowerCase();
            const text = (rawType === "end")
                ? (msg.text ?? msg.message ?? "Execution finished.")
                : (msg.text ?? msg.message ?? JSON.stringify(msg));
            const type: ConsoleLineType =
                rawType === "error" ? "error"
                    : rawType === "success" ? "success"
                        : rawType === "warn" || rawType === "warning" ? "warning"
                            : rawType === "system" ? "system"
                                : rawType === "code" ? "code"
                                    : rawType === "code_error" ? "code_error"
                                        : rawType === "end" ? "end"
                                : "info";

            return {text: typeof text === "string" ? text : JSON.stringify(text), type};
        }

        return {text: String(msg), type: "info"};
    };

    const lineClassByType = (type: ConsoleLineType) => {
        if (type === "error") return "text-red-400";
        if (type === "code_error") return "text-red-400";
        if (type === "success") return "text-green-400";
        if (type === "warning") return "text-orange-400";
        if (type === "info") return "text-blue-400";
        if (type === "end") return "text-violet-300 font-semibold";
        if (type === "system") return "text-neutral-500";
        return "text-neutral-300";
    };

    const codeBlockClassByType = (type: ConsoleLineType) => {
        if (type === "code_error") {
            return "bg-red-950/30 border border-red-500/40 text-red-400";
        }
        return "bg-neutral-900/80 border border-neutral-700/70 text-neutral-200";
    };

    const statusDotClass = () => {
        if (status === "connected") return "bg-emerald-400";
        if (status === "error") return "bg-red-400";
        if (status === "closed") return "bg-violet-400";
        if (status === "disconnected") return "bg-orange-400";
        return "bg-neutral-500";
    };

    useEffect(() => {
        // subscribe to socket events
        const unsub = socket.subscribe((msg: any) => {
            if (msg?.__socket_error) {
                appendLine(toConsoleLine(msg));
                setStatus("error");
                return;
            }

            if (msg?.__socket_closed) {
                appendLine(toConsoleLine(msg));
                setStatus("closed");
                return;
            }
            if (msg && msg.type === "pong") {
                // ignore or show heartbeat
            } else {
                const line = toConsoleLine(msg);
                if (line.type === "end") {
                    ExampleCall();
                    setStatus("connected");
                }
                appendLine(line);
            }
        });

        // small status refresher: if ws URL exists, show connected/disconnected
        if (wsURL) {
            socket.connect(wsURL).then(() => setStatus("connected")).catch(() => setStatus("disconnected"));
        }

        return () => unsub();
    }, [wsURL]);

    useEffect(() => {
        // auto scroll to bottom
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [lines]);

    const clear = () => setLines([]);

    return (
        <div
            style={{height: `${consoleHeight}px`}}
            className="bg-neutral-900 border border-neutral-800/80 rounded-xl shadow-lg shadow-black/40 flex flex-col shrink-0 overflow-hidden"
        >
            <div
                className="flex items-center justify-between px-4 h-10 border-b border-neutral-800/60 bg-neutral-900 select-none">
                <div className="flex items-center gap-2 text-neutral-400">
                    <TerminalSquare size={14}/>
                    <span className="text-xs font-bold uppercase tracking-widest">Console</span>
                    <div className="group relative ml-2 flex items-center">
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass()} shadow-[0_0_10px_rgba(255,255,255,0.12)]`}></span>
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-neutral-700 bg-neutral-950/95 px-2 py-1 text-[11px] font-medium text-neutral-200 opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-1">
                            {status}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={clear}
                            className="p-1 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 rounded-md transition-all active:scale-95">
                        Clear
                    </button>
                    <button
                        onClick={() => setIsConsoleOpen(false)}
                        className="p-1 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/80 rounded-md transition-all active:scale-95"
                    >
                        <X size={16} strokeWidth={2.5}/>
                    </button>
                </div>
            </div>
            <div
                ref={containerRef}
                className={`flex-1 p-4 font-mono text-sm text-neutral-300 overflow-auto bg-neutral-950/40 shadow-inner shadow-black/20 ${scrollbarClasses}`}>
                {lines.length === 0 ? (
                    <>
                        <p className="text-neutral-500">¯\_(ツ)_/¯</p>
                    </>
                ) : (
                    lines.map((l, idx) => (
                        (l.type === "code" || l.type === "code_error") ? (
                            <pre key={idx}
                                 className={`leading-5 m-0 whitespace-pre-wrap p-3 rounded-md my-1 font-mono text-[13px] ${codeBlockClassByType(l.type)}`}>{l.text}</pre>
                        ) : (l.type === "end") ? (
                            <p key={idx} className="leading-5 m-0 whitespace-pre-wrap mt-8 bg-violet-900/20 border border-violet-500/40 text-violet-200 rounded-md px-3 py-2 my-1">{l.text}</p>
                        ) : (
                            <p key={idx} className={`leading-5 m-0 whitespace-pre-wrap ${lineClassByType(l.type)}`}>{l.text}</p>
                        )
                    ))
                )}
            </div>
        </div>
    );
}