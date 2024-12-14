import { CompletionItemKind, languages, Position, Range } from "vscode";
import { docInfo } from "../global";
import { isProbablyJSONUI } from "../indexer/utils";
import { textureMap } from "../indexer/texureDataProvider";

export const TextureDeffenitionProvider = languages.registerCompletionItemProvider(docInfo, {
    provideCompletionItems(document, position) {
        const line = document.lineAt(position.line).text;
        if (
            !isProbablyJSONUI(document.getText()) ||
            !line.includes("texture")
        ) return

        let charIndex = -1
        let offset = 0

        while (charIndex === -1) {
            if (position.character - offset <= 0) break
            const char = line[position.character - ++offset]
            if (char === "\"") {
                charIndex = position.character - offset
            }
        }

        if (charIndex === -1) return
        const prevText = line.substring(0, charIndex)
        if (!(/\"\w+\"\s*:\s*/).test(prevText)) return

        return [...textureMap.keys()].map(x => ({
            sortText: "!!!",
            label: x,
            insertText: x,
            kind: CompletionItemKind.EnumMember,
            range: new Range(
                new Position(position.line, charIndex + 1),
                position
            )
        }))
    }
}, "\"")