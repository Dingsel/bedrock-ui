import { languages, Location, Position, Uri } from "vscode";
import { getElementByKey } from "../indexer";
import { readFileSync } from "fs";

export const ReferenceDeffenitionProvider = languages.registerDefinitionProvider("json", {
    provideDefinition(document, position) {
        const lineText = document.lineAt(position.line).text;

        const jsonKeyPattern = /"([\w-]+)@([\w-]+)\.([\w-]+)"\s*:/;
        const match = jsonKeyPattern.exec(lineText.trim());
        if (match === null) return;

        const key = `${match[1]}@${match[2]}.${match[3]}`;

        const jsonElement = getElementByKey(key);
        const meta = jsonElement?.metadata;
        if (!meta) return;

        const { filePath } = meta;
        if (!filePath) return;

        const fileLines = readFileSync(filePath).toString().split("\n")
        const startLine = fileLines.findIndex(x => x.includes(`"${jsonElement.elementName}`))
        const startChar = fileLines.find(x => x.includes(`"${jsonElement.elementName}`))?.indexOf("\"") ?? 0

        const startPosition = new Position(startLine !== -1 ? startLine : 0, startChar);


        return new Location(Uri.file(filePath), startPosition);
    }
})