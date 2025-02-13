import { registerProviders } from './providerIndex.js';
import { useColours } from './providers/jsonColorization.js';
import { inizialize } from './indexer/dataProvider.js';
import "./indexer/glovalVariables.js"
import { initializeTextures } from './indexer/texureDataProvider.js';

/**
 * @param {import('vscode').ExtensionContext} context
*/
export function activate(context) {
	//const config = workspace.getConfiguration('editor');
	//config.update("wordSeparators", "`~!@%^&*()-=+[{]}\\|;:'\",.<>/?")
	useColours()
	inizialize()
	initializeTextures()
	registerProviders(context)
}
export function deactivate() { }