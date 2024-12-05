import vscode, { Uri, languages, Location, Position, CompletionItemKind, Range } from 'vscode';
import { dispose, getElementByKey, totalElementsAutoCompletions } from './indexer.js';


/**
 * @param {vscode.ExtensionContext} context
*/
export function activate(context) {
	context.subscriptions.push(
		languages.registerCompletionItemProvider("json", {
			// @ts-ignore
			provideCompletionItems(document, position) {
				const textBeforeCursor = document.getText(new vscode.Range(new vscode.Position(position.line, 0), position));
				const atSymbolIndex = textBeforeCursor.lastIndexOf('@');

				if (atSymbolIndex === -1) return [];

				const word = textBeforeCursor.substring(atSymbolIndex + 1, position.character).trim();
				const filteredSuggestions = totalElementsAutoCompletions.filter(x =>
					`${x.namespace}.${x.elementName}`.includes(word)
				);

				return filteredSuggestions.map(x => ({
					label: `@${x.namespace}.${x.elementName}`,
					kind: vscode.CompletionItemKind.Variable,
					insertText: `@${x.namespace}.${x.elementName}`,
					range: new vscode.Range(
						new vscode.Position(position.line, atSymbolIndex),
						position
					)
				}));
			}
		}, "@")
	)
	context.subscriptions.push(
		languages.registerCompletionItemProvider("json", {
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

				return keyData.metadata?.variables.map(x => ({
					sortText: "!",
					label: x,
					kind: CompletionItemKind.Variable,
					insertText: x,
				}));
			}
		}, "$")
	)

	context.subscriptions.push(
		languages.registerDefinitionProvider("json", {
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

				console.log(filePath)

				return new Location(Uri.file(filePath), startPosition);
			}
		})
	);
}
export function deactivate() {
	dispose()
}
