import { readFileSync } from "fs";
import { getKeyInfomation, removeComments } from "./utils";

/**
 * @type {Map<string, JSONUIElement>}
 */
export const elementMap = new Map()

/**
 * @param {string} filePath
 */
export function parseFilePath(filePath) {
    const fileString = removeComments(readFileSync(filePath).toString())

    try {
        const json = JSON.parse(fileString)
        const namespace = json["namespace"]

        if (!namespace) return

        Object.entries(json).forEach(([key, value]) => {
            if (typeof value !== "object") return
            traverseKeys(key, value, { filePath, namespace, controlSegments: [], variables: [] })
        })


    } catch (error) {
        console.error(`Error Parsing ${filePath}`, error)
    }
}

/**
 * @param {string} key
 * @param {any} element
 * @param {ElementMeta} objectMeta
 * @param {JSONUIElement} [parentElement=undefined] 
 */
function traverseKeys(key, element, objectMeta, parentElement = undefined) {
    const keyInfo = getKeyInfomation(key)
    const { elementName } = keyInfo
    const elemId = getElementIdFromKey(keyInfo, objectMeta)

    const existingElement = elementMap.get(elemId)

    const jsonUIELement = /**@type {JSONUIElement} */ (existingElement || {
        elementMeta: {},
        elementName,
        parentElement,
        referencingElement: getReferenceElementByKey(keyInfo, objectMeta.namespace, objectMeta.controlSegments)
    })

    const variables = Object.keys(element).filter(x => x.startsWith("$")).map(x => x.split("|", 2)[0])
    const elementMeta = { ...objectMeta, variables }
    jsonUIELement.elementMeta = elementMeta

    jsonUIELement.isDummy = false
    elementMap.set(elemId, jsonUIELement)

    objectMeta = { ...objectMeta, controlSegments: objectMeta.controlSegments.concat([elementName]), variables }

    /**
     * @param {unknown} controllElement
     */
    function parseChild(controllElement) {
        if (typeof controllElement !== "object" || Array.isArray(controllElement) || controllElement === null) return
        const element = /** @type {{[key : string] : any}}*/(controllElement)
        const name = Object.keys(controllElement)[0]
        if (!name || typeof element[name] !== "object" || Array.isArray(element[name] || element === null)) return
        traverseKeys(
            name,
            element[name],
            { ...objectMeta, variables: [] },
            jsonUIELement
        )
    }

    if (Array.isArray(element?.controls)) {
        element.controls.forEach(parseChild)
    }

    Object.keys(element).filter(x => x.startsWith("$")).forEach((key) => {
        if (!Array.isArray(element[key])) return
        element[key].forEach(parseChild)
    })
}

/**
 * @param {ReturnType<typeof getKeyInfomation>} elemKey
 * @param {ElementMeta} meta
*/
function getElementIdFromKey(elemKey, meta) {
    if (meta.controlSegments.length >= 1) {
        return `${elemKey.elementName}/${meta.controlSegments.join("/")}@${meta.namespace}`
    }
    return `${elemKey.elementName}@${meta.namespace}`
}

/**
 * @param {ReturnType<typeof getKeyInfomation>} keyMeta
 * @param {string} fallbackNamespace
 * @param {string[]} [controlSegments=[]] 
 * @returns {JSONUIElement | undefined}
 */
function getReferenceElementByKey({ targetNamespace, targetReference }, fallbackNamespace, controlSegments = []) {
    const namespace = targetNamespace ?? fallbackNamespace

    if (!targetNamespace && !targetReference) return

    if (!targetNamespace && targetReference && controlSegments.length >= 1) {
        const keyId = `${targetReference}/${controlSegments.join("/")}@${namespace}`
        return elementMap.get(keyId) || createDummyElement(targetReference, namespace, controlSegments)
    }

    if (targetReference) {
        const keyId = `${targetReference}@${targetNamespace}`
        return elementMap.get(keyId) || createDummyElement(targetReference, namespace)
    }

    console.error("Code should never come here", targetNamespace, targetReference, controlSegments)
    return
}

/**
 * @param {string} elementName
 * @param {string} namespace
 * @param {string[]} [controlSegments=[]] 
 * @returns {JSONUIElement}
 */
function createDummyElement(elementName, namespace, controlSegments = []) {
    /**@type {JSONUIElement} */
    const dummy = {
        elementMeta: {
            namespace,
            variables: [],
            controlSegments: [],
            filePath: undefined
        },
        elementName,
        parentElement: undefined,
        referencingElement: undefined,
        isDummy: true
    }

    if (controlSegments.length >= 1) {
        elementMap.set(`${elementName}/${controlSegments.join("/")}@${namespace}`, dummy)
    } else {
        elementMap.set(`${elementName}@${namespace}`, dummy)
    }

    return dummy
}