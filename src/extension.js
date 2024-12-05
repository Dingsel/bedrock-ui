import vscode, { Uri, languages, Location, Position, CompletionItemKind, Range } from 'vscode';
import { dispose, getElementByKey, totalElementsAutoCompletions } from './indexer.js';
import { registerProviders } from './providerIndex.js';


/**
 * @param {vscode.ExtensionContext} context
*/
export function activate(context) {
	const config = vscode.workspace.getConfiguration('editor');
	config.update("wordSeparators", "`~!@#%^&*()-=+[{]}\\|;:'\",.<>/?")

	registerProviders(context)

}
export function deactivate() {
	dispose()
}
