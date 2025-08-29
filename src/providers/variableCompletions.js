import { CompletionItemKind, languages, MarkdownString, Position, Range } from "vscode";
import { elementMap } from "../indexer/parseFile";
import { getCurrentNamespace, getKeyInfomation, getVariableTree, isProbablyJSONUI } from "../indexer/utils";
import { docInfo } from "../global";
import { globalVariables } from "../indexer/globalVariables.js";

export const VariableCompletionProvider = languages.registerCompletionItemProvider(docInfo, {
    provideCompletionItems(document, position) {
        if (!isProbablyJSONUI(document.getText())) return

        function findPatternUpwards() {
            const searchPattern = /"([\w@\.]+)"\s*:\s*\{/;
            let match = null;
            let lineOffset = 0;

            while (match === null) {
                if (position.line - lineOffset <= 0) break;
                const lineText = document.lineAt(position.line - lineOffset).text;
                match = lineText.match(searchPattern)
                lineOffset++
            }

            if (!match) return
            return match[1]
        }

        const anyKeyString = findPatternUpwards();
        if (!anyKeyString) return;
        const keyInfo = getKeyInfomation(anyKeyString)
        // console.log("VariableCompletionProvider: Found key info:", keyInfo);
        const elementKey = `${keyInfo.elementName}@${keyInfo.targetNamespace ?? getCurrentNamespace(document.getText())}`;
        // console.log("VariableCompletionProvider: Found element key:", elementKey);
        const element = elementMap.get(elementKey);
        // console.log("VariableCompletionProvider: Found element:", element);
        const variables = element? [...new Set(getVariableTree(element))] : globalVariables;

        const textBeforeCursor = document.getText(new Range(new Position(position.line, 0), position));
        const dollarSignIndex = textBeforeCursor.lastIndexOf('$');
        const unclosedQuoteIndex = textBeforeCursor.lastIndexOf('"');
        const hasUnclosedQuote = unclosedQuoteIndex > dollarSignIndex && !textBeforeCursor.slice(unclosedQuoteIndex + 1).includes('"');

        const range = dollarSignIndex >= 0
            ? new Range(new Position(position.line, dollarSignIndex), position)
            : new Range(position, position);


        //Maybe mark duplicate variables? (Like if they are global)
        return variables.map(({ name, defaultValue, isGlobal }) => {
            let documentation;
            if(defaultValue != undefined) {
                documentation = `${isGlobal? "Global variable" : "Default"}: \`${typeof defaultValue == "string"? `"${defaultValue}"` : defaultValue}\``;
            }
            return {
                sortText: "!!!",
                label: name,
                documentation: documentation && new MarkdownString(documentation),
                insertText: dollarSignIndex >= 0 || hasUnclosedQuote ? name : `"${name}": `,
                kind: CompletionItemKind.Variable,
                range
            };
        });
    }
}, "$")