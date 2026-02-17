import {useEffect, useRef, useState, useCallback} from 'preact/hooks';
import * as monaco from 'monaco-editor';
import {Project} from "../../components/openProjetcModal";
import {LoadingElement} from "../../components/LoadingElement";
import {useAppContext} from "../../AppContext";

monaco.editor.defineTheme("dark-neutral", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
        "editor.background": "#0E0E0E",
        "editor.foreground": "#FFFFFF",
        "editorLineNumber.foreground": "#5A5A5A",
        "editorLineNumber.activeForeground": "#FFFFFF",
        "editorCursor.foreground": "#FFFFFF",
        "editor.selectionBackground": "#2A2A2A",
        "editor.lineHighlightBackground": "#1A1A1A",
        "editorWhitespace.foreground": "#2B2B2B",
        "editorIndentGuide.background": "#2B2B2B",
    },
});

interface MonacoEditorProps {
    isSavedCallBack: (saved: boolean) => void;
    file?: string;
    project?: Project;
}

export function MonacoEditor({isSavedCallBack, file, project}: MonacoEditorProps) {
    const editorContainer = useRef<HTMLDivElement>(null);
    const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const fileRef = useRef(file);
    const projectRef = useRef(project);
    const isSavedRef = useRef(true);

    const isSavedCallBackRef = useRef(isSavedCallBack);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {backendURL, showError} = useAppContext();

    useEffect(() => {
        saveContent().then(() => {
            fileRef.current = file;
            projectRef.current = project;
        });
    }, [file, project]);

    useEffect(() => {
        isSavedCallBackRef.current = isSavedCallBack;
    }, [isSavedCallBack]);

    const setSaveState = useCallback((saved: boolean) => {
        isSavedRef.current = saved;
        if (isSavedCallBackRef.current) {
            isSavedCallBackRef.current(saved);
        }
    }, []);

    const saveContent = useCallback(async () => {
        if (!editorInstance.current || isSavedRef.current) return;

        console.log("Saving content...");
        const contentToSave = editorInstance.current.getValue();
        const currentFile = fileRef.current;
        const currentProject = projectRef.current;

        if (!currentFile || !currentProject) return;

        try {
            const response = await fetch(`${backendURL}/files/update`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    content: contentToSave,
                    projectName: currentProject.name,
                    path: currentFile,
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                showError(err.error || `Failed to save file: ${response.statusText}`);
                return;
            }

            setSaveState(true);
        } catch (err: any) {
            showError(err.message || 'Error saving file content');
            console.error('Error saving file content:', err);
        }
    }, [backendURL, showError, setSaveState]);

    useEffect(() => {
        if (!file || !project) return;

        const switchFile = async () => {
            if (!isSavedRef.current) {
                await saveContent();
            }

            setIsLoading(true);

            try {
                const response = await fetch(`${backendURL}/files?projectName=${project.name}&path=${file}`);
                if (!response.ok) {
                    showError(`Failed to load file: ${response.statusText}`);
                    throw new Error("Failed to fetch");
                }

                const data = await response.json();

                if (editorInstance.current) {
                    editorInstance.current.setValue(data.content);
                    isSavedRef.current = true;
                    if (isSavedCallBackRef.current) isSavedCallBackRef.current(true);
                }
            } catch (err: any) {
                showError(err.message);
                if (editorInstance.current) editorInstance.current.setValue("// Error loading file");
            } finally {
                setIsLoading(false);
            }
        };

        switchFile();

    }, [file, project?.name, backendURL]);

    useEffect(() => {
        if (editorContainer.current && !editorInstance.current) {
            editorInstance.current = monaco.editor.create(editorContainer.current, {
                value: '',
                language: 'c',
                theme: 'dark-neutral',
                automaticLayout: true,
                fontFamily: "JetBrains Mono, Fira Code, monospace",
                fontSize: 14,
                minimap: {enabled: false},
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
            });

            editorInstance.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                isSavedRef.current = false;
                saveContent();
            });

            editorInstance.current.onDidChangeModelContent(() => {
                if (isSavedRef.current) {
                    setSaveState(false);
                }
            });
        }

        return () => {
            editorInstance.current?.dispose();
            editorInstance.current = null;
        };
    }, [setSaveState, saveContent]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isSavedRef.current) {
                saveContent();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [saveContent]);

    return (
        <div className="relative w-full h-full">
            {!file && (
                <div className="flex items-center justify-center h-full text-neutral-500">
                    <p className="text-sm italic">Select a file to start editing...</p>
                </div>
            )}

            {file && isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
                    <LoadingElement text={"Loading file content..."}/>
                </div>
            )}

            <div ref={editorContainer} className="w-full h-full"/>
        </div>
    );
}