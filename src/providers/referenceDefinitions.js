import { languages, Position, Range, Uri } from "vscode";
import { readFileSync, existsSync } from "fs";
import { elementMap } from "../indexer/parseFile";
import { docInfo } from "../global";
import { getCurrentNamespace, isProbablyJSONUI } from "../indexer/utils";

/**
 * @param {string} searchString
 * @param {string} elementName
 */
function isStringElement(searchString, elementName) {
    const trimmed = searchString.trim()
    return trimmed.startsWith(`"${elementName}"`) ||
        trimmed.startsWith(`"${elementName}@`)
}

/**
 * @param {string} reference
 * @param {string} currentNamespace
 * @returns {string}
 */
function getReferenceKey(reference, currentNamespace) {
    if(reference.includes(".")) {
        const dotI = reference.indexOf(".");
        return `${reference.slice(dotI + 1)}@${reference.slice(0, dotI)}`;
    }
    return `${reference}@${currentNamespace}`;
}

export const ReferenceDefinitionProvider = languages.registerDefinitionProvider(docInfo, {
    provideDefinition(document, position) {
        if (!isProbablyJSONUI(document.getText())) return
        
        const lineText = document.lineAt(position.line).text;

        // Check if the cursor is positioned on a reference part (after the @ symbol)
        const cursorChar = position.character;
        const atIndex = lineText.indexOf('@');
        
        if (atIndex === -1 || cursorChar <= atIndex) return
        
        // Extract the reference part that the cursor is on
        const afterAt = lineText.substring(atIndex + 1);
        const quoteEndIndex = afterAt.indexOf('"');
        if (quoteEndIndex === -1) return;
        
        const reference = afterAt.substring(0, quoteEndIndex);

        // Look for the referenced element in the elementMap
        // The reference should be found directly in the current namespace
        const currentNamespace = getCurrentNamespace(document.getText());
        const referenceKey = getReferenceKey(reference, currentNamespace);
        
        const jsonElement = elementMap.get(referenceKey);

        if (!jsonElement) {
            console.log(`ReferenceDefinitions: Element not found in elementMap: "${referenceKey}"`);
            return;
        }
        const meta = jsonElement.elementMeta;
        if (!meta) {
            console.log("ReferenceDefinitions: No metadata found for element");
            return;
        }
        const { filePath } = meta;
        if (!filePath) {
            console.log("ReferenceDefinitions: No file path in metadata");
            return;
        }
        // Check if file exists
        if (!existsSync(filePath)) {
            console.log("ReferenceDefinitions: File does not exist:", filePath);
            return;
        }

        try {
            const fileLines = readFileSync(filePath, 'utf8').split("\n");
            const startLine = fileLines.findIndex((x, lineI) => isStringElement(x, jsonElement.elementName) && lineI != position.line);
            
            if (startLine === -1) {
                console.log("ReferenceDefinitions: Element not found in file lines");
                return;
            }

            const matchingLine = fileLines[startLine];
            const startChar = matchingLine.indexOf(`"${jsonElement.elementName}"`);
            
            if (startChar === -1) {
                console.log(`ReferenceDefinitions: Could not find start character "${jsonElement.elementName}" in "${matchingLine}"`);
                return;
            }

            const startPosition = new Position(startLine, startChar);
            const targetRange = new Range(
                startPosition,
                new Position(startLine, startChar + jsonElement.elementName.length)
            );

            // make the whole part after "@" be clickable
            const originSelectionRange = new Range(
                new Position(position.line, atIndex + 1),
                new Position(position.line, atIndex + 1 + reference.length)
            );

            return [
                {
                    originSelectionRange,
                    targetUri: Uri.file(filePath),
                    targetRange
                }
            ];
        } catch (error) {
            console.error("ReferenceDefinitions: Error reading file:", error);
            return;
        }
    }
})