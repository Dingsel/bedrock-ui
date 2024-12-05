import { CompletionItemKind, languages, Position, Range } from "vscode";
import { totalElementsAutoCompletions } from "../indexer";

export const ReferenceCompletionProvider = languages.registerCompletionItemProvider("json", {
    provideCompletionItems(document, position) {
        const textBeforeCursor = document.getText(new Range(new Position(position.line, 0), position));
        const atSymbolIndex = textBeforeCursor.lastIndexOf('@');

        if (atSymbolIndex === -1) return [];

        const word = textBeforeCursor.substring(atSymbolIndex + 1, position.character).trim();
        const filteredSuggestions = totalElementsAutoCompletions.filter(x =>
            `${x.namespace}.${x.elementName}`.includes(word)
        );

        return filteredSuggestions.map(x => ({
            label: `@${x.namespace}.${x.elementName}`,
            kind: CompletionItemKind.Variable,
            insertText: `@${x.namespace}.${x.elementName}`,
            range: new Range(
                new Position(position.line, atSymbolIndex),
                position
            )
        }));
    }
}, "@")