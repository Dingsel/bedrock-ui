import { workspace } from 'vscode';
import { registerProviders } from './providerIndex.js';
import { useColours } from './providers/jsonColorization.js';
import { inizialize } from './indexer/dataProvider.js';

export const docInfo = "json"

/**
 * @param {import('vscode').ExtensionContext} context
*/
export function activate(context) {
	const config = workspace.getConfiguration('editor');
	config.update("wordSeparators", "`~!@#%^&*()-=+[{]}\\|;:'\",.<>/?")

	useColours()
	registerProviders(context)

	inizialize()
}
export function deactivate() { }