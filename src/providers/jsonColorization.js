import { Position, Range, window, workspace } from "vscode";
import { elementDecoration, namespaceDecoration, variableDecoration } from "../global";

export function useColours() {
    workspace.onDidOpenTextDocument(() => {
        if (window.activeTextEditor && window.activeTextEditor.document.languageId === 'json') {
            colorizeJson(window.activeTextEditor);
        }
    });

    window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document.languageId === 'json') {
            colorizeJson(editor);
        }
    });

    if (window.activeTextEditor && window.activeTextEditor.document.languageId === 'json') {
        colorizeJson(window.activeTextEditor);
    }

    /**
     * @param {import("vscode").TextEditor} editor
     */
    function colorizeJson(editor) {
        const document = editor.document;
        const text = document.getText();

        const syntaxes = [
            {
                regex: /(?<=)@[^.\s]+(?=\.)/g,
                decoration: namespaceDecoration
            },
            {
                regex: /(?<=["\b])(\w+)(?=@|\s*":\s*\{)/g,
                decoration: elementDecoration
            },
            {
                regex: /(?<=\.)\w+(?=\":)/g,
                decoration: elementDecoration
            },
            {
                regex: /(?<=\"namespace\"\s*:\s*)(\"\w+")/g,
                decoration: namespaceDecoration
            },
            {
                regex: /(?<=["\b])(\$[0-9a-zA-Z_-|]+)/g,
                decoration: variableDecoration
            },
        ];

        /**@type {{[key : string]: {range: Range, decoration: import("vscode").TextEditorDecorationType}[]}}*/
        const matches = {};
        syntaxes.forEach(({ regex, decoration }) => {
            let match;

            while ((match = regex.exec(text)) !== null) {
                const m = match[2] || match[1] || match[0];

                const startPos = document.positionAt(regex.lastIndex - m.length);
                const endPos = document.positionAt(regex.lastIndex);

                matches[decoration.key] ??= []

                matches[decoration.key].push({
                    range: new Range(startPos, endPos),
                    decoration
                });
            }
        });
        Object.entries(matches).forEach(([key, arr]) => {
            editor.setDecorations(arr[0].decoration, arr.map(x => x.range));
        })
    }
}