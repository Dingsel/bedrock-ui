import { workspace } from "vscode"
import { elementMap, parseFilePath } from "./parseFile"
import { join } from "path"
import { glob } from "glob"

/**
 * @type {JSONUIElement[]}
 */
export let totalElementsAutoCompletions = []

export async function inizialize() {
    const pattern = `./**/ui/**/*.+(json)`
    const watcher = workspace.createFileSystemWatcher("**/ui/**")

    async function initializeFully() {
        const workspacePath = workspace?.workspaceFolders?.[0]?.uri.fsPath
        if (!workspacePath) return console.warn("Not in a workspace")
        for await (const file of glob.globIterate(pattern, { nodir: true, realpath: false, cwd: workspacePath })) {
            parseFilePath(join(workspacePath, file))
        }

        elementMap.forEach((element, key) => {
            totalElementsAutoCompletions.push(element)
        })

        console.log(elementMap)
    }

    watcher.onDidChange((file) => {
        parseFilePath(file.fsPath)
        console.log("refreshed:", elementMap)
    })

    watcher.onDidCreate((file) => {
        parseFilePath(file.fsPath)
    })

    watcher.onDidDelete((file) => {
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