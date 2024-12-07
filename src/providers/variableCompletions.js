import { CompletionItemKind, languages, Position, Range } from "vscode";
import { elementMap } from "../indexer/parseFile";
import { getKeyInfomation, getVariableTree } from "../indexer/utils";

export const VariableCompletionProvider = languages.registerCompletionItemProvider("json", {
    provideCompletionItems(document, position) {
        const searchPattern = /"([\w@\.]+)"\s*:\s*\{/;

        function findPatternUpwards() {
            let match = null;
            let lineOffset = 0;

            while (match === null) {
                if (position.line - (lineOffset++) <= 0) break;
                const lineText = document.lineAt(position.line - (lineOffset++)).text;
                match = lineText.match(searchPattern)
            }

            if (!match) return
            return match[1]
        }

        const anyKeyString = findPatternUpwards();

        if (!anyKeyString) return;
        const keyInfo = getKeyInfomation(anyKeyString)
        const element = elementMap.get(`${keyInfo.targetReference}@${keyInfo.targetNamespace}`);
        console.warn(anyKeyString)

        if (!element) return;

        const textBeforeCursor = document.getText(new Range(new Position(position.line, 0), position));
        const dollarSignIndex = textBeforeCursor.lastIndexOf('$');
        const unclosedQuoteIndex = textBeforeCursor.lastIndexOf('"');
        const hasUnclosedQuote = unclosedQuoteIndex > dollarSignIndex && !textBeforeCursor.slice(unclosedQuoteIndex + 1).includes('"');

        const range = dollarSignIndex >= 0
            ? new Range(new Position(position.line, dollarSignIndex), position)
            : new Range(position, position);


        return getVariableTree(element).map((x) => ({
            sortText: "!!!",
            label: x,
            insertText: dollarSignIndex >= 0 || hasUnclosedQuote ? x : `"${x}": `,
            kind: CompletionItemKind.Variable,
            range
        }));
    }
}, "$")