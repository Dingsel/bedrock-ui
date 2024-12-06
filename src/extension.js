import vscode, { Uri, languages, Location, Position, CompletionItemKind, Range } from 'vscode';
import { dispose, getElementByKey, totalElementsAutoCompletions } from './indexer.js';
import { registerProviders } from './providerIndex.js';
import { useColours } from './providers/jsonColorization.js';

export const docInfo = "json"

/**
 * @param {vscode.ExtensionContext} context
*/
export function activate(context) {
	const config = vscode.workspace.getConfiguration('editor');
	config.update("wordSeparators", "`~!@#%^&*()-=+[{]}\\|;:'\",.<>/?")

	useColours()
	registerProviders(context)
}
export function deactivate() {
	dispose()
}
