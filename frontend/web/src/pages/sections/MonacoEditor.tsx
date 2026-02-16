import {useEffect, useRef, useState} from 'preact/hooks';
import * as monaco from 'monaco-editor';
import {Project} from "../../components/openProjetcModal";
import {LoadingElement} from "../../components/LoadingElement";
import {useAppContext} from "../../AppContext";

interface MonacoEditorProps {
    isSavedCallBack: (saved: boolean) => void;
    file?: string;
    project?: Project;
}

export function MonacoEditor({isSavedCallBack, file, project}: MonacoEditorProps) {
    const editorContainer = useRef(null);
    const editorRef = useRef(null);
    const fileRef = useRef(file);
    const projectRef = useRef(project);

    const [isSaved, setIsSaved] = useState<boolean>(true);
    const [content, setContent] = useState<string | null>(null);

    const {backendURL, showError} = useAppContext();

    useEffect(() => {
        saveContent();

        fileRef.current = file;
        projectRef.current = project;
    }, [file, project]);

    const saveContent = () => {
        if (editorRef.current) {
            console.log("Saving content:", editorRef.current.getValue());

            const currentFile = fileRef.current;
            const currentProject = projectRef.current;

            fetch(`${backendURL}/files/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: editorRef.current.getValue(),
                    projectName: currentProject.name,
                    path: currentFile,
                }),
            }).then(async (response) => {
                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    showError(err.error || `Failed to save file content: ${response.statusText}`);
                    throw new Error(err.error || `Failed to save file content: ${response.statusText}`);
                }

                isSavedCallBack(true);
                setIsSaved(true);
            }).catch((err) => {
                showError(err.message || 'Error saving file content');
                console.error('Error saving file content:', err);
            });

        }
    }

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


    useEffect(() => {
        if (editorContainer.current) {
            editorRef.current = monaco.editor.create(editorContainer.current, {
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

            editorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                if (editorRef.current) {
                    saveContent();
                }
            });

            editorRef.current.onDidChangeModelContent(() => {
                isSavedCallBack(false);
                setIsSaved(false);
            });

            return () => {
                editorRef.current?.dispose();
            };
        }
    }, [fileRef]);

    useEffect(() => {
        if (!file || !project) return;

        fetch(`${backendURL}/files?projectName=${project.name}&path=${file}`).then(async (response) => {
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                setContent(null);
                showError(err.error || `Failed to fetch file content: ${response.statusText}`);
                throw new Error(err.error || `Failed to fetch file content: ${response.statusText}`);
            }
            return response.json();
        }).then((data: { content: string }) => {
            console.log(data);
            setContent(data.content);
            if (editorRef.current) {
                editorRef.current.setValue(data.content);
            }
        }).catch((err) => {
            setContent(null);
            showError(err.message || 'Error fetching file content');
            console.error('Error fetching file content:', err);
        });
    }, [file]);

    // every 10s save content
    useEffect(() => {
        const interval = setInterval(() => {
            if (isSaved) return;

            if (editorRef.current) {
                saveContent();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [isSavedCallBack]);

    return (
        file ? (
            content === null ? (
                <LoadingElement text={"Loading file content..."}/>
            ) : (
                <div ref={editorContainer} className="w-full h-full"/>
            )
        ) : (
            <div className="flex items-center justify-center h-full text-neutral-500">
                <p className="text-sm italic">Select a file to start editing...</p>
            </div>
        )
    )
}
