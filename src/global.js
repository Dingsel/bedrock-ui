import { window } from "vscode";

export const namespaceDecoration = window.createTextEditorDecorationType({
    color: '#44C9B0',
});

export const elementDecoration = window.createTextEditorDecorationType({
    color: '#4FC1FF',
});

export const variableDecoration = window.createTextEditorDecorationType({
    color: '#DCDC9D',
});

export const bindingDecoration = window.createTextEditorDecorationType({
    color: '#C66969',
});

export const docInfo = ["json", "jsonc", "json5"]