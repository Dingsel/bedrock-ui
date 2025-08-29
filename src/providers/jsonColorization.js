import { Position, Range, window, workspace } from "vscode";
import { bindingDecoration, createDecorations, elementDecoration, namespaceDecoration, variableDecoration } from "../global";
import { isProbablyJSONUI } from "../indexer/utils";

// /** @type {TextEditorDecorationType[]} */
// let oldDecorations = [];

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

    workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('workbench.colorTheme')) {
            createDecorations();
            if (window.activeTextEditor?.document?.languageId?.includes('json')) {
                colorizeJson(window.activeTextEditor);
            }
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
        const isGlobalVariables = document.fileName.endsWith("_global_variables.json");

        if (!isGlobalVariables && !isProbablyJSONUI(text)) return

        // let oldDecoration;
        // while (oldDecoration = oldDecorations.pop()) {
        //     editor.setDecorations(oldDecoration, []);
        // }

        const syntaxes = getSyntaxes(isGlobalVariables);

        /**@type {{[key : string]: {range: Range, decoration: import("vscode").TextEditorDecorationType}[]}}*/
        const matches = {};
        syntaxes.forEach(({ regex, decoration }) => {
            let match;

            while ((match = regex.exec(text)) !== null) {
                const m = match[2] || match[1] || match[0];

                const startPos = document.positionAt(regex.lastIndex - m.length);
                const endPos = document.positionAt(regex.lastIndex);

                if (isInComment(document, document.offsetAt(startPos))) continue;

                matches[decoration.key] ??= []

                matches[decoration.key].push({
                    range: new Range(startPos, endPos),
                    decoration
                });
            }
        });
        Object.entries(matches).forEach(([, arr]) => {
            editor.setDecorations(arr[0].decoration, arr.map(x => x.range));
            // oldDecorations.push(arr[0].decoration);
        })
    }
}

/**
 * @param {boolean} isGlobalVariables
 * @returns {{ regex: RegExp, decoration: TextEditorDecorationType }[]}
 */
function getSyntaxes(isGlobalVariables) {
    let syntaxes = [{
        regex: /(\$[\w_|]+)/g,
        decoration: variableDecoration
    }];
    if (!isGlobalVariables) {
        syntaxes.push(
            {
                regex: /(?<=@)[^.\s]+(?=\.)/g,
                decoration: namespaceDecoration
            },
            {
                regex: /(?<!\$)(?<="|\b)(\w+(\/\w+)*)(?=@|\s*"\s*:\s*\{)/g,
                decoration: elementDecoration
            },
            {
                regex: /(?<=@[^.\s]+\.)\w+(?=\")/g,
                decoration: elementDecoration
            },
            {
                regex: /(?<=\"namespace\"\s*:\s*)(\"[^.\s]+")/g,
                decoration: namespaceDecoration
            },

            {
                regex: /(#[\w_]+)/g,
                decoration: bindingDecoration
            }
        );
    }
    return syntaxes;
}

/**
 * @param {import('vscode').TextDocument} document
 * @param {number} start
 * @returns {boolean}
 */
function isInComment(document, start) {
    // JSONC comments start with // or /* ... */
    // Check if the match is inside a line comment
    const line = document.lineAt(document.positionAt(start).line).text;
    const lineCommentIndex = line.indexOf('//');
    if (lineCommentIndex !== -1) {
        const charPos = document.positionAt(start).character;
        if (charPos >= lineCommentIndex) return true;
    }
    // Check block comment (/* ... */)
    const beforeMatch = document.getText(new Range(new Position(0, 0), document.positionAt(start)));
    const lastBlockStart = beforeMatch.lastIndexOf('/*');
    const lastBlockEnd = beforeMatch.lastIndexOf('*/');
    return lastBlockStart > lastBlockEnd;
}

/** @import { TextEditorDecorationType } from "vscode" */