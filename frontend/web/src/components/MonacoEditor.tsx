import { useEffect, useRef } from 'preact/hooks';
import * as monaco from 'monaco-editor';

export function MonacoEditor() {
	const editorContainer = useRef(null);
	const editorRef = useRef(null);

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
				value: `
#include <stdio.h>

int main() {
	printf("Hello, World!\\n");
	return 0;
}
				`.trim(),
				language: 'c',
				theme: 'dark-neutral',
				automaticLayout: true,
				fontFamily: "JetBrains Mono, Fira Code, monospace",
				fontSize: 14,
				minimap: { enabled: false },
				cursorBlinking: "smooth",
				renderLineHighlight: "all",
			});

			return () => {
				editorRef.current?.dispose();
			};
		}
	}, []);

	return <div ref={editorContainer} className="w-full h-full" />;
}
