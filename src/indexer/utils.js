import { globalVariables } from "./glovalVariables";

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