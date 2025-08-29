import { ControlCompletionProvider, ReferenceCompletionProvider } from "./providers/referenceCompletions";
import { ReferenceDefinitionProvider } from "./providers/referenceDefinitions";
import { TextureDefinitionProvider } from "./providers/textureCompletionLensProvider";
import { VariableCompletionProvider } from "./providers/variableCompletions";

const providers = [
    ReferenceCompletionProvider,
    VariableCompletionProvider,
    ReferenceDefinitionProvider,
    ControlCompletionProvider,
    TextureDefinitionProvider
]

/**
 * @param {import("vscode").ExtensionContext} context
*/
export function registerProviders(context) {
    context.subscriptions.push(...providers)
}