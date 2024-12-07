import { CompletionItemKind, languages, Position, Range } from "vscode";
import { totalElementsAutoCompletions } from "../indexer/dataProvider";

export const ReferenceCompletionProvider = languages.registerCompletionItemProvider("json", {
    provideCompletionItems(document, position) {
        const textBeforeCursor = document.getText(new Range(new Position(position.line, 0), position));
        const atSymbolIndex = textBeforeCursor.lastIndexOf('@');

        if (atSymbolIndex === -1) return [];

        const word = textBeforeCursor.substring(atSymbolIndex + 1, position.character).trim();

        const filteredSuggestions = totalElementsAutoCompletions.filter(x =>
            `${x.elementMeta.namespace}.${x.elementName}`.includes(word) && x.elementMeta.controlSegments.length <= 0
        );


        return filteredSuggestions.map(x => {
            return {
                label: `@${x.elementMeta.namespace}.${x.elementName}`,
                kind: CompletionItemKind.Variable,
                insertText: `@${x.elementMeta.namespace}.${x.elementName}`,
                range: new Range(
                    new Position(position.line, atSymbolIndex),
                    position
                )
            }
        });
    }
}, "@")

export const ControlCompletionProvider = languages.registerCompletionItemProvider("json", {
    provideCompletionItems(document, position) {
        const textBeforeCursor = document.lineAt(position.line);
        const charIndex = textBeforeCursor.firstNonWhitespaceCharacterIndex

        const symdex = textBeforeCursor.text[charIndex];
        if (symdex !== "\"") return

        const filteredSuggestions = totalElementsAutoCompletions.filter(x => x.elementMeta.controlSegments.length >= 1);

        return filteredSuggestions.map(x => {
            return {
                label: `${x.elementMeta.controlSegments.join("/")}/${x.elementName}`,
                kind: CompletionItemKind.Variable,
                insertText: `${x.elementMeta.controlSegments.join("/")}/${x.elementName}`,
                range: new Range(
                    new Position(position.line, charIndex + 1),
                    position
                )
            }
        });
    }
}, "\"")