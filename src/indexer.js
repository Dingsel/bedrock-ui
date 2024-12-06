import { readFileSync } from "fs";
import { glob } from "glob";
import { join } from "path";
import { workspace } from "vscode";

/**@type {Map<string, JSONUIElement>} */
let elementMap = new Map()

/**
 * @type {JSONUIElement[]}
 */
export let totalElementsAutoCompletions = []

/**
 * @param {string} key
 */
export function getElementByKey(key) {
    const { elementName, targetNamespace, targetReference } = getKeyInfomation(key);
    if (!targetNamespace) return;
    return elementMap.get(`${targetReference}@${targetNamespace}`)
}

/**
 * @param {string} filePath
 */
function revalidateFile(filePath) {
    const fileString = readFileSync(filePath).toString();
    const withoutComments = fileString.replace(/"(?:\\.|[^"\\])*"|\s*\/\/.*|\/\*[\s\S]*?\*\//g, (match) => {
        if (match.startsWith('"')) {
            return match;
        }
        return '';
    });

    try {
        const json = JSON.parse(withoutComments);
        const namespace = json.namespace;
        if (!namespace || typeof namespace !== "string") return;

        Object.keys(json).forEach(key => {
            if (key === "namespace") return;
            const variables = Object.keys(json[key]).filter(x => x.startsWith("$")).map(x => x.split("|", 2)[0])

            index(getKeyInfomation(key), namespace, json[key], { filePath, variables });
        });
    } catch (error) {
        console.error(`Error parsing JSON file: ${withoutComments}`, error);
    }
}

/**
 * @type {import("vscode").FileSystemWatcher}
 */
let watcher;

async function main() {
    const pattern = `./**/ui/**/*.+(json)`

    async function initializeFully() {
        const workspacePath = workspace?.workspaceFolders?.[0]?.uri.fsPath
        if (!workspacePath) return console.warn("Not in a workspace")
        for await (const file of glob.globIterate(pattern, { nodir: true, realpath: false, cwd: workspacePath })) {
            revalidateFile(join(workspacePath, file))
        }

        elementMap.forEach((element, key) => {
            totalElementsAutoCompletions.push(element)
        })
    }

    initializeFully()

    watcher = workspace.createFileSystemWatcher("**/ui/**")

    watcher.onDidChange((file) => {
        revalidateFile(file.fsPath)
        console.log("refreshed:", elementMap)
    })

    watcher.onDidCreate((file) => {
        revalidateFile(file.fsPath)
    })

    watcher.onDidDelete((file) => {
        elementMap = new Map()
        totalElementsAutoCompletions = []

        initializeFully()
    })

}

export function dispose() {
    watcher?.dispose()
}

main()


/**
 * @param {{controlls?: {[key: string]: any;}[];}} jsonElement
 * @param {string} namespace
 * @param {ReturnType<typeof getKeyInfomation>} keyInfo
 * @param {import("./types").JSONElementMeta | undefined} [additionalData]
 */
function index(keyInfo, namespace, jsonElement, additionalData) {
    const { elementName: sourceName, targetNamespace, targetReference } = keyInfo
    const element = elementMap.get(`${sourceName}@${namespace}`) || new JSONUIElement(namespace, sourceName)

    if (targetNamespace) {
        const elem = elementMap.get(`${targetReference}@${targetNamespace}`) || new JSONUIElement(targetNamespace, targetReference)

        elem.addReferencedBy(element)
        element.setReference(elem)

        elementMap.set(elem.toString(), elem)
    }

    if (additionalData) {
        element.setMetaData(additionalData)
    }

    elementMap.set(element.toString(), element)

    jsonElement.controlls?.forEach(controllElement => {
        const name = Object.keys(controllElement)[0]
        if (!name) return

        index(getKeyInfomation(name), namespace, controllElement[name])
    })
}

/**
 * @param {string} key
 */
function getKeyInfomation(key) {
    const [main, extra] = key.split('@', 2);
    const elementName = main.trim();

    if (!extra) return {
        elementName,
        targetNamespace: undefined,
        targetReference: undefined
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

class JSONUIElement {
    /**@type {JSONUIElement | undefined} */
    reference
    /**@type {JSONUIElement[]} */
    referencedBy = []

    /**
     * @type {import("./types").JSONElementMeta | undefined}
     */
    metadata

    /**
     * @param {string} namespace
     * @param {string} elementName
     */
    constructor(namespace, elementName) {
        this.namespace = namespace;
        this.elementName = elementName;
    }

    toString() {
        return `${this.elementName}@${this.namespace}`;
    }
    getValue() {
        return elementMap.get(this.toString());
    }

    /**
     * @param {import("./types").JSONElementMeta} data
     */
    setMetaData(data) {
        this.metadata = data;
    }

    /**
     * @param {JSONUIElement} reference
     */
    setReference(reference) {
        this.reference = reference;
    }
    /**
     * @param {JSONUIElement} reference
     */
    addReferencedBy(reference) {
        this.referencedBy.push(reference);
    }
}