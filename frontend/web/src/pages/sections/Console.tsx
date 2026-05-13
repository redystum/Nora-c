import {TerminalSquare, X} from "lucide-preact";
import {useEffect, useRef, useState} from "preact/hooks";
import socket from "../../utils/socket";
import {useAppContext} from "../../AppContext";

interface ConsoleProps {
    consoleHeight: number;
    scrollbarClasses: string;
    setIsConsoleOpen: (open: boolean) => void;
}

export function Console({consoleHeight, scrollbarClasses, setIsConsoleOpen}: ConsoleProps) {
    const [lines, setLines] = useState<string[]>([]);
    const [status, setStatus] = useState<string>("idle");
    const containerRef = useRef<HTMLDivElement | null>(null);
    const {wsURL} = useAppContext();

    useEffect(() => {
        // subscribe to socket events
        const unsub = socket.subscribe((msg: any) => {
            // socket manager can emit raw strings or JSON objects
            if (msg?.__socket_error) {
                setLines(prev => [...prev, `[socket error]`]);
                setStatus("error");
                return;
            }
            if (msg?.__socket_closed) {
                setLines(prev => [...prev, `[socket closed: ${msg.code}]`]);
                setStatus("closed");
                return;
            }
            // handle ping/pong or other control messages
            if (typeof msg === "string") {
                setLines(prev => [...prev, msg]);
            } else if (msg && msg.type === "pong") {
                // ignore or show heartbeat
            } else if (msg && typeof msg === "object") {
                // prefer msg.text or msg.message
                const text = msg.text ?? msg.message ?? JSON.stringify(msg);
                setLines(prev => [...prev, typeof text === "string" ? text : JSON.stringify(text)]);
            } else {
                setLines(prev => [...prev, String(msg)]);
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
                    <span className="ml-2 text-xs text-neutral-500">[{status}]</span>
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
                        <p className="text-neutral-500">~ System initialized.</p>
                        <p className="text-green-400/80 mt-1">➜ <span className="text-neutral-300">Ready for output...</span></p>
                    </>
                ) : (
                    lines.map((l, idx) => (
                        <pre key={idx} className="leading-5 m-0 whitespace-pre-wrap">{l}</pre>
                    ))
                )}
            </div>
        </div>
    );
}