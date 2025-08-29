import { workspace } from "vscode"
import { elementMap, parseFilePath } from "./parseFile"
import { join } from "path"
import { glob } from "glob"
import { parseGlobalVarsFromFilePath } from "./globalVariables"

/**
 * @type {JSONUIElement[]}
 */
export let totalElementsAutoCompletions = []

export async function inizialize() {
    const pattern = `**/ui/**/*.+(json)`
    const watcher = workspace.createFileSystemWatcher("**/ui/**")

    async function initializeFully() {
        const workspacePath = workspace?.workspaceFolders?.[0]?.uri.fsPath
        if (!workspacePath) return console.warn("Not in a workspace")
        for await (const file of glob.globIterate(pattern, { nodir: true, cwd: workspacePath })) {
            const fileName = join(workspacePath, file)

            if (file.endsWith("_global_variables.json")) {
                parseGlobalVarsFromFilePath(fileName)
            } else parseFilePath(fileName)
        }

        elementMap.forEach((element) => {
            totalElementsAutoCompletions.push(element)
        })

        console.log(elementMap)
    }

    watcher.onDidChange((file) => {
        if (file.fsPath.endsWith("_global_variables.json")) {
            parseGlobalVarsFromFilePath(file.fsPath)
        } else {
            elementMap.clear()
            totalElementsAutoCompletions = []

            initializeFully()
        }
        console.log("refreshed:", elementMap)
    })

    watcher.onDidCreate((file) => {
        if (file.fsPath.endsWith("_global_variables.json")) {
            parseGlobalVarsFromFilePath(file.fsPath)
        } else {
            elementMap.clear()
            totalElementsAutoCompletions = []

            initializeFully()
        }
    })

    watcher.onDidDelete(() => {
        elementMap.clear()
        totalElementsAutoCompletions = []

        initializeFully()
    })

    initializeFully()

    return {
        dispose() {
            watcher.dispose()
        }
    }
}