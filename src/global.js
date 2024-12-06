import { window } from "vscode";

export const namespaceDecoration = window.createTextEditorDecorationType({
    color: '#44C9B0',
});

export const elementDecoration = window.createTextEditorDecorationType({
    color: '#569CD6',
});

export const variableDecoration = window.createTextEditorDecorationType({
    color: '#DCDC9D',
});