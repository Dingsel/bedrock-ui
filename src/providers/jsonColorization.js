import { languages, Range, window, workspace } from "vscode";

export function useColours() {
    const decorationType = window.createTextEditorDecorationType({
        color: '#44C9B0',
    });

    workspace.onDidOpenTextDocument((document) => {
        if (document.languageId === 'json') {
            colorizeJsonKey(document);
        }
    });

    window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document.languageId === 'json') {
            colorizeJsonKey(editor.document);
        }
    });

    if (window.activeTextEditor && window.activeTextEditor.document.languageId === 'json') {
        colorizeJsonKey(window.activeTextEditor.document);
    }

    /**
     * @param {import("vscode").TextDocument} document
     */
    function colorizeJsonKey(document) {
        const editor = window.activeTextEditor;
        const regex = /"namespace"\s*:\s*("[^"]+")|(?!")@([^\s".]+)/g;
        const text = document.getText();

        let match;
        const ranges = [];

        while ((match = regex.exec(text)) !== null) {
            const matchColour = match[1] || match[2]
            if (matchColour) {
                const start = document.positionAt(match.index + match[0].indexOf(matchColour));
                const end = document.positionAt(match.index + match[0].indexOf(matchColour) + matchColour.length);
                ranges.push(new Range(start, end));
            }
        }

        if (editor) {
            editor.setDecorations(decorationType, ranges);
            languages.setTextDocumentLanguage(editor.document, 'jsonc')
        }
    }
}