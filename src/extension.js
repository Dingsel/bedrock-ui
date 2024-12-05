import vscode, { Uri, languages, Location, Position } from 'vscode';
import { dispose, getElementByKey } from './indexer.js';


/**
 * @param {vscode.ExtensionContext} context
*/
export function activate(context) {
	context.subscriptions.push(
		languages.registerDefinitionProvider('json', {
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
	);
}
export function deactivate() {
	dispose()
}
