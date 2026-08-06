import * as monaco from 'monaco-editor';

const cConfiguration: monaco.languages.LanguageConfiguration = {
    comments: {
        lineComment: "//",
        blockComment: ["/*", "*/"]
    },
    brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"]
    ],
    autoClosingPairs: [
        { open: "[", close: "]" },
        { open: "{", close: "}" },
        { open: "(", close: ")" },
        { open: "'", close: "'", notIn: ["string", "comment"] },
        { open: '"', close: '"', notIn: ["string"] }
    ],
    surroundingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
    ],
    folding: {
        markers: {
            start: new RegExp("^\\s*#pragma\\s+region\\b"),
            end: new RegExp("^\\s*#pragma\\s+endregion\\b")
        }
    }
};

const cMonarchTokens: monaco.languages.IMonarchLanguage = {
    defaultToken: "",
    tokenPostfix: ".c",
    brackets: [
        { token: "delimiter.curly", open: "{", close: "}" },
        { token: "delimiter.parenthesis", open: "(", close: ")" },
        { token: "delimiter.square", open: "[", close: "]" },
        { token: "delimiter.angle", open: "<", close: ">" }
    ],
    keywords: [
        "abstract", "amp", "array", "auto", "bool", "break", "case", "catch",
        "char", "class", "const", "constexpr", "const_cast", "continue", "cpu",
        "decltype", "default", "delegate", "delete", "do", "double", "dynamic_cast",
        "each", "else", "enum", "event", "explicit", "export", "extern", "false",
        "final", "finally", "float", "for", "friend", "gcnew", "generic", "goto",
        "if", "in", "initonly", "inline", "int", "interface", "interior_ptr",
        "internal", "literal", "long", "mutable", "namespace", "new", "noexcept",
        "nullptr", "__nullptr", "operator", "override", "partial", "pascal",
        "pin_ptr", "private", "property", "protected", "public", "ref", "register",
        "reinterpret_cast", "restrict", "return", "safe_cast", "sealed", "short",
        "signed", "sizeof", "static", "static_assert", "static_cast", "struct",
        "switch", "template", "this", "thread_local", "throw", "tile_static",
        "true", "try", "typedef", "typeid", "typename", "union", "unsigned",
        "using", "virtual", "void", "volatile", "wchar_t", "where", "while",
        "_Packed", "_Imaginary", "_Bool", "_Complex", "size_t"
    ],
    customYellow: [
        'web_start', 'web_navigate_to', 'web_find_element', 'web_insert_into', 'ERROR'
    ],
    operators: [
        "=", ">", "<", "!", "~", "?", ":", "==", "<=", ">=", "!=",
        "&&", "||", "++", "--", "+", "-", "*", "/", "&", "|", "^",
        "%", "<<", ">>", "+=", "-=", "*=", "/=", "&=", "|=", "^=",
        "%=", "<<=", ">>="
    ],
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    escapes: /\\(?:[0abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    integersuffix: /([uU](ll|LL|l|L)|(ll|LL|l|L)?[uU]?)/,
    floatsuffix: /[fFlL]?/,
    encoding: /u|u8|U|L/,
    tokenizer: {
        root: [
            [/^\s*\$.*$/, "custom-green-line"],
            [/@encoding?R\"(?:([^ ()\\\t]*))\(/, { token: "string.raw.begin", next: "@raw.$1" }],
            [
                /[a-zA-Z_]\w*/,
                {
                    cases: {
                        "@customYellow": "custom-yellow",
                        "@keywords": { token: "keyword.$0" },
                        "@default": "identifier"
                    }
                }
            ],
            [/^\s*#\s*include/, { token: "keyword.directive.include", next: "@include" }],
            [/^\s*#\s*\w+/, "keyword.directive"],
            { include: "@whitespace" },
            [/\[\s*\[/, { token: "annotation", next: "@annotation" }],
            [/[{}()<>\[\]]/, "@brackets"],
            [
                /@symbols/,
                {
                    cases: {
                        "@operators": "delimiter",
                        "@default": ""
                    }
                }
            ],
            [/\d*\d+[eE]([\-+]?\d+)?(@floatsuffix)/, "number.float"],
            [/\d*\.\d+([eE][\-+]?\d+)?(@floatsuffix)/, "number.float"],
            [/0[xX][0-9a-fA-F']*[0-9a-fA-F](@integersuffix)/, "number.hex"],
            [/0[0-7']*[0-7](@integersuffix)/, "number.octal"],
            [/0[bB][0-1']*[0-1](@integersuffix)/, "number.binary"],
            [/\d[\d']*\d(@integersuffix)/, "number"],
            [/\d(@integersuffix)/, "number"],
            [/[;,.]/, "delimiter"],
            [/"([^"\\]|\\.)*$/, "string.invalid"],
            [/"/, "string", "@string"],
            [/'[^\\']'/, "string"],
            [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
            [/'/, "string.invalid"]
        ],
        whitespace: [
            [/[ \t\r\n]+/, ""],
            [/\/\*(?!\/)/, "comment", "@comment"],
            [/\/\*/, "comment", "@comment"],
            [/\/\/.*\\$/, "comment", "@linecomment"],
            [/\/\/.*$/, "comment"]
        ],
        comment: [
            [/[^\/*]+/, "comment"],
            [/\*\//, "comment", "@pop"],
            [/[\/*]/, "comment"]
        ],
        linecomment: [
            [/.*[^\\]$/, "comment", "@pop"],
            [/[^]+/, "comment"]
        ],
        string: [
            [/[^\\"]+/, "string"],
            [/@escapes/, "string.escape"],
            [/\\./, "string.escape.invalid"],
            [/"/, "string", "@pop"]
        ],
        raw: [
            [/[^)]+/, "string.raw"],
            [/\)$S2\"/, { token: "string.raw.end", next: "@pop" }],
            [/\)/, "string.raw"]
        ],
        annotation: [
            { include: "@whitespace" },
            [/using|alignas/, "keyword"],
            [/[a-zA-Z0-9_]+/, "annotation"],
            [/[,:]/, "delimiter"],
            [/[()]/, "@brackets"],
            [/\]\s*\]/, { token: "annotation", next: "@pop" }]
        ],
        include: [
            [
                /(\s*)(<)([^<>]*)(>)/,
                [
                    "",
                    "keyword.directive.include.begin",
                    "string.include.identifier",
                    { token: "keyword.directive.include.end", next: "@pop" }
                ]
            ],
            [
                /(\s*)(")([^"]*)(")/,
                [
                    "",
                    "keyword.directive.include.begin",
                    "string.include.identifier",
                    { token: "keyword.directive.include.end", next: "@pop" }
                ]
            ]
        ]
    }
};

export function registerCIntellisense() {
    monaco.languages.setLanguageConfiguration('c', cConfiguration);
    monaco.languages.setMonarchTokensProvider('c', cMonarchTokens);

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
                kind: monaco.languages.CompletionItemKind.Class,
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
                'pow', 'sqrt', 'ceil', 'floor', 'fabs', 'fmod',
                'web_start', 'web_navigate_to', 'web_find_element', 'web_insert_into', 'ERROR'
            ].map(func => ({
                label: func,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: func,
                range: range,
            }));

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
