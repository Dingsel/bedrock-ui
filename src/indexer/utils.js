import { extensions } from "vscode";
import { globalVariables } from "./globalVariables";
import path from "node:path";

/**
 * @param {string} string
 */
export function removeComments(string) {
    const withoutComments = string.replace(/"(?:\\.|[^"\\])*"|\s*\/\/.*|\/\*[\s\S]*?\*\//g, (match) => {
        if (match.startsWith('"')) {
            return match;
        }
        return '';
    });
    return withoutComments
}

/**
 * @param {string} key
 */
export function getKeyInfomation(key) {
    const [main, extra] = key.split('@', 2);
    const elementName = main.trim();

    if (!extra) return {
        elementName,
        targetNamespace: undefined,
        targetReference: undefined
    }

    if (extra && !key.includes(".", key.indexOf("@"))) {
        return {
            elementName,
            targetNamespace: undefined,
            targetReference: extra
        }
    }

    const [ns, ref] = extra.split('.', 2);

    const targetNamespace = ns?.trim();
    const targetReference = ref?.trim();

    return {
        elementName,
        targetNamespace,
        targetReference
    }
}

/**
 * 
 * @param {JSONUIElement} element 
 * @returns {Variable[]}
 */
export function getVariableTree(element) {
    /**@type {JSONUIElement | undefined} */
    let currentElement = element
    let arr = [];

    do {
        arr.push(...currentElement.elementMeta.variables)
        currentElement = currentElement.referencingElement
    } while (currentElement)

    return arr.concat(globalVariables)
}

/**
 * @param {string} fileContent
 */
//Do it better yourself smh
export function isProbablyJSONUI(fileContent) {
    return fileContent.includes("\"namespace\":")
}

/**
 * Extract the namespace from the JSON content
 * @param {string} jsonContent 
 * @returns {string}
 */
export function getCurrentNamespace(jsonContent) {
    try {
        const json = JSON.parse(removeComments(jsonContent));
        return json.namespace;
    } catch {
        return jsonContent.match(/(?<="namespace"\s*:\s+")(.+?)"/)?.[1] ?? "";
    }
}

/**
 * @param {string} themeName
 * @returns {(token: string) => { background?: string, fontStyle?: string, foreground?: string }}
 */
export function getTokenColorsForTheme(themeName) {
    const tokenColors = new Map();
    let currentThemePath;
    for (const extension of extensions.all) {
        /** @type {{label: string, path: string}[]} */
        const themes = extension.packageJSON.contributes && extension.packageJSON.contributes.themes;
        const currentTheme = themes && themes.find((theme) => theme.label === themeName);
        if (currentTheme) {
            currentThemePath = path.join(extension.extensionPath, currentTheme.path);
            break;
        }
    }
    const themePaths = [];
    if (currentThemePath) { themePaths.push(currentThemePath); }
    while (themePaths.length > 0) {
        const themePath = themePaths.pop();
        if (!themePath) throw new Error("this is to make typescript happy");
        /** @type {{ include?: string, tokenColors?: { scope: string | string[], settings: { background?: string, fontStyle?: string, foreground?: string } }[]} } */
        const theme = require(themePath);
        if (!theme) continue;

        if (theme.include) {
            themePaths.push(path.join(path.dirname(themePath), theme.include));
        }

        if (!theme.tokenColors) continue;

        theme.tokenColors.forEach((rule) => {
            if (typeof rule.scope === "string" && !tokenColors.has(rule.scope)) {
                tokenColors.set(rule.scope, rule.settings);
            } else if (rule.scope instanceof Array) {
                rule.scope.forEach((scope) => {
                    if (!tokenColors.has(rule.scope)) {
                        tokenColors.set(scope, rule.settings);
                    }
                });
            }
        });
    }
    
    return token => {
        while (!tokenColors.has(token)) {
            if (token.includes(".")) {
                token = token.slice(0, token.lastIndexOf("."));
            } else {
                return undefined;
            }
        }
        return tokenColors.get(token);
    };
}