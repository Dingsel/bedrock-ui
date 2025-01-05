import { CompletionItemKind, languages, Position, Range } from "vscode";
import { totalElementsAutoCompletions } from "../indexer/dataProvider";
import { docInfo } from "../global";
import { isProbablyJSONUI } from "../indexer/utils";

export const ReferenceCompletionProvider = languages.registerCompletionItemProvider(docInfo, {
    provideCompletionItems(document, position) {
        if (!isProbablyJSONUI(document.getText())) return
        const textBeforeCursor = document.getText(new Range(new Position(position.line, 0), position));
        const atSymbolIndex = textBeforeCursor.lastIndexOf('@');

        if (atSymbolIndex === -1) return [];

        const word = textBeforeCursor.substring(atSymbolIndex + 1, position.character).trim();

        const filteredSuggestions = totalElementsAutoCompletions.filter(x =>
            `${x.elementMeta.namespace}.${x.elementName}`.includes(word) && x.elementMeta.controlSegments.length <= 0
        );

        const uniqueSuggestions = filteredSuggestions.filter((x, i, a) => a.findIndex(y => y.elementName === x.elementName) === i);

        return uniqueSuggestions.map(x => {
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

export const ControlCompletionProvider = languages.registerCompletionItemProvider(docInfo, {
    provideCompletionItems(document, position) {
        if (!isProbablyJSONUI(document.getText())) return
        const textBeforeCursor = document.lineAt(position.line);
        const charIndex = textBeforeCursor.firstNonWhitespaceCharacterIndex

        const symdex = textBeforeCursor.text[charIndex];
        if (symdex !== "\"") return

        const filteredSuggestions = totalElementsAutoCompletions.filter(x => x.elementMeta.controlSegments.length >= 1);
        const uniqueSuggestions = filteredSuggestions.filter((x, i, a) => a.findIndex(y => y.elementName === x.elementName) === i);

        return uniqueSuggestions.map(x => {
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