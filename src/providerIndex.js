import { ReferenceCompletionProvider } from "./providers/referenceCompletions";
import { ReferenceDeffenitionProvider } from "./providers/referenceDeffenitions";
import { VariableCompletionProvider } from "./providers/variableCompletions";

const providers = [
    ReferenceCompletionProvider,
    VariableCompletionProvider,
    ReferenceDeffenitionProvider
]

/**
 * @param {import("vscode").ExtensionContext} context
*/
export function registerProviders(context) {
    context.subscriptions.push(...providers)
}