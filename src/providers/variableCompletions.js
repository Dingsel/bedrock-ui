import { CompletionItemKind, languages, Position, Range } from "vscode";
import { getElementByKey } from "../indexer";

export const VariableCompletionProvider = languages.registerCompletionItemProvider("json", {
    provideCompletionItems(document, position) {
        const text = document.getText();
        const offset = document.offsetAt(position);

        const searchPattern = /"([\w@\.]+)"\s*:\s*\{/;

        /**
         * @param {string} text
         * @param {number} offset
         * @param {RegExp} pattern
         */
        function findPatternUpwards(text, offset, pattern) {
            const slicedText = text.slice(0, offset);
            let match;
            let index = slicedText.length;

            while (index > 0) {
                const result = slicedText.slice(0, index).match(pattern);
                if (result) {
                    match = result[1];
                    break;
                }
                index = slicedText.lastIndexOf('\n', index - 1);
            }

            return match;
        }

        const anyKeyString = findPatternUpwards(text, offset, searchPattern);

        if (!anyKeyString) return;
        const keyData = getElementByKey(anyKeyString);

        if (!keyData) return;

        const textBeforeCursor = document.getText(new Range(new Position(position.line, 0), position));
        const dollarSignIndex = textBeforeCursor.lastIndexOf('$');
        const unclosedQuoteIndex = textBeforeCursor.lastIndexOf('"');
        const hasUnclosedQuote = unclosedQuoteIndex > dollarSignIndex && !textBeforeCursor.slice(unclosedQuoteIndex + 1).includes('"');

        const range = dollarSignIndex >= 0
            ? new Range(new Position(position.line, dollarSignIndex), position)
            : new Range(position, position);

        return keyData.metadata?.variables.map((x) => ({
            sortText: "!!!",
            label: x,
            insertText: dollarSignIndex >= 0 || hasUnclosedQuote ? x : `"${x}": `,
            kind: CompletionItemKind.Variable,
            range
        }));
    }
}, "$")