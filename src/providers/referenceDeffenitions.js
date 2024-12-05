import { languages, Location, Uri } from "vscode";
import { getElementByKey } from "../indexer";

export const ReferenceDeffenitionProvider = languages.registerDefinitionProvider("json", {
    provideDefinition(document, position) {
        const text = document.getText();
        const jsonKeyPattern = /"([\w-]+)@([\w-]+).([\w-]+)"\s*:/g;
        const match = jsonKeyPattern.exec(text)
        if (match === null) return

        const key = `${match[1]}@${match[2]}.${match[3]}`;

        const jsonElemet = getElementByKey(key)
        const meta = jsonElemet?.metadata
        if (!meta) return

        const { filePath } = meta
        if (!filePath) return

        const startIndex = match.index;
        const startPosition = document.positionAt(startIndex);

        return new Location(Uri.file(filePath), startPosition);
    }
})