import { Position, Range, window, workspace } from "vscode";
import { bindingDecoration, elementDecoration, namespaceDecoration, variableDecoration } from "../global";
import { isProbablyJSONUI } from "../indexer/utils";

export function useColours() {
    workspace.onDidOpenTextDocument(() => {
        if (window.activeTextEditor && window.activeTextEditor.document.languageId.includes('json')) {
            colorizeJson(window.activeTextEditor);
        }
    });

    window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document.languageId.includes('json')) {
            colorizeJson(editor);
        }
    });

    workspace.onDidChangeTextDocument((event) => {
        const editor = window.activeTextEditor;
        if (editor && editor.document === event.document && editor.document.languageId.includes('json')) {
            colorizeJson(editor);
        }
    });

    if (window.activeTextEditor && window.activeTextEditor.document.languageId.includes('json')) {
        colorizeJson(window.activeTextEditor);
    }

    /**
     * @param {import("vscode").TextEditor} editor
     */
    function colorizeJson(editor) {
        const document = editor.document;
        const text = document.getText();

        if (!isProbablyJSONUI(text)) return

        const syntaxes = [
            {
                regex: /(?<=)@[^.\s]+(?=\.)/g,
                decoration: namespaceDecoration
            },
            {
                regex: /(?<=["\b])([\w\/]+)(?=@|\s*"\s*:\s*\{)/g,
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
                regex: /(\$[\w_|]+)/g,
                decoration: variableDecoration
            },
            {
                regex: /(#[\w_]+)/g,
                decoration: bindingDecoration
            }
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