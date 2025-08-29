import { window, workspace } from "vscode";
import { getTokenColorsForTheme } from "./indexer/utils.js";

const namespaceToken = "entity.name.class";
const elementToken = "variable.other.constant";
const variableToken = "entity.name.function";
const bindingToken = "entity.name.operator";

/** @type {TextEditorDecorationType} */
export let namespaceDecoration;

/** @type {TextEditorDecorationType} */
export let elementDecoration;

/** @type {TextEditorDecorationType} */
export let variableDecoration;

/** @type {TextEditorDecorationType} */
export let bindingDecoration;

createDecorations();

export function createDecorations() {
    const themeName = workspace.getConfiguration("workbench").get("colorTheme");
    const tokenColors = getTokenColorsForTheme(themeName);
    
    namespaceDecoration = window.createTextEditorDecorationType({
        color: tokenColors(namespaceToken)?.foreground ?? "#4EC9B0",
    });
    elementDecoration = window.createTextEditorDecorationType({
        color: tokenColors(elementToken)?.foreground ?? "#4FC1FF",
    });
    variableDecoration = window.createTextEditorDecorationType({
        color: tokenColors(variableToken)?.foreground ?? "#DCDCAA",
    });
    bindingDecoration = window.createTextEditorDecorationType({
        color: tokenColors(bindingToken)?.foreground ?? "#C586C0",
    });
}

export const docInfo = ["json", "jsonc", "json5"]

/** @import { TextEditorDecorationType } from "vscode" */