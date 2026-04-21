import * as monaco from 'monaco-editor';

export function registerCIntellisense() {
    return monaco.languages.registerCompletionItemProvider('c', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            const keywords = [
                'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extern',
                'float', 'for', 'goto', 'if', 'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static',
                'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while', '_Packed', '_Imaginary'
            ].map(keyword => ({
                label: keyword,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: keyword,
                range: range,
            }));

            const types = [
                'int', 'char', 'float', 'double', 'void', 'long', 'short', 'signed', 'unsigned', 'struct', 'union', 'enum',
                'bool', '_Bool', 'size_t', 'ptrdiff_t', 'int8_t', 'uint8_t', 'int16_t', 'uint16_t', 'int32_t', 'uint32_t',
                'int64_t', 'uint64_t'
            ].map(type => ({
                label: type,
                kind: monaco.languages.CompletionItemKind.Class, // Best approximation for types
                insertText: type,
                range: range,
            }));

            const functions = [
                'printf', 'scanf', 'fprintf', 'fscanf', 'sprintf', 'sscanf', 'vprintf', 'vfprintf', 'vsprintf',
                'malloc', 'calloc', 'realloc', 'free', 'exit', 'abort', 'getenv', 'system',
                'strcpy', 'strncpy', 'strcat', 'strncat', 'strcmp', 'strncmp', 'strlen', 'strchr', 'strrchr', 'strstr',
                'memcpy', 'memmove', 'memcmp', 'memset', 'memchr',
                'fopen', 'freopen', 'fclose', 'fflush', 'setbuf', 'setvbuf', 'fgetc', 'fgets', 'fputc', 'fputs', 'getc',
                'getchar', 'gets', 'putc', 'putchar', 'puts', 'ungetc', 'fread', 'fwrite', 'fseek', 'ftell', 'rewind',
                'fgetpos', 'fsetpos', 'clearerr', 'feof', 'ferror', 'perror',
                'abs', 'div', 'labs', 'ldiv', 'rand', 'srand', 'atof', 'atoi', 'atol', 'strtod', 'strtol', 'strtoul',
                'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'sinh', 'cosh', 'tanh', 'exp', 'log', 'log10',
                'pow', 'sqrt', 'ceil', 'floor', 'fabs', 'fmod'
            ].map(func => ({
                label: func,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: func,
                range: range,
            }));

            // Basic snippet for main function
             const snippets = [
                {
                    label: 'main',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                        'int main() {',
                        '\t$0',
                        '\treturn 0;',
                        '}'
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Main function',
                    range: range
                },
                 {
                    label: 'include',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: '#include <$1>',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Include header',
                    range: range
                },
                  {
                    label: 'if',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                        'if (${1:condition}) {',
                        '\t$0',
                        '}'
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'If statement',
                    range: range
                },
                {
                    label: 'for',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: [
                        'for (int ${1:i} = 0; ${1:i} < ${2:count}; ${1:i}++) {',
                        '\t$0',
                        '}'
                    ].join('\n'),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'For loop',
                    range: range
                },
            ];

            // Scan document for other identifiers
            const text = model.getValue();
            const identifierPattern = /[a-zA-Z_]\w*/g;
            const identifiers = new Set<string>();
            let match;
            while ((match = identifierPattern.exec(text)) !== null) {
                identifiers.add(match[0]);
            }

            const existingLabels = new Set([...keywords, ...types, ...functions].map(i => i.label));

            const detectedIdentifiers = Array.from(identifiers)
                .filter(id => !existingLabels.has(id))
                .map(id => ({
                    label: id,
                    kind: monaco.languages.CompletionItemKind.Text,
                    insertText: id,
                    range: range
                }));


            return { suggestions: [...keywords, ...types, ...functions, ...snippets, ...detectedIdentifiers] };
        }
    });
}



