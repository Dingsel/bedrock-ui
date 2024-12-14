import { glob } from "glob";
import { workspace } from "vscode";

/**@type {Map<string, TextureSlice>} */
export const textureMap = new Map()

/**
 * @param {string} string
 */
function getFileKey(string) {
    const arr = string.split(".")
    arr.pop()

    return arr.join(".").replaceAll("\\", "/")
}

export async function initializeTextures() {
    const pattern = `**/textures/**/*.{json,jsonc,json5,png,jpg}`
    const watcher = workspace.createFileSystemWatcher("**/textures/**")

    const workspacePath = workspace?.workspaceFolders?.[0]?.uri.fsPath
    if (!workspacePath) return console.warn("Not in a workspace")
    for await (const file of glob.globIterate(pattern, { nodir: true, cwd: workspacePath })) {
        parseTexture(file)
    }

    watcher.onDidCreate((file) => {
        parseTexture(file.fsPath)
    })

    watcher.onDidChange((file) => {
        parseTexture(file.fsPath)
    })

    watcher.onDidDelete((file) => {
        textureMap.delete(file.fsPath)
    })

    return {
        dispose() {
            watcher.dispose()
        }
    }
}

/**
 * @param {string} path
 */
function parseTexture(path) {
    const key = getFileKey(path)
    const prevData = textureMap.get(key) || {}

    if (path.endsWith(".png") || path.endsWith(".jpg")) {
        prevData.texturePath = path
    }

    if (path.includes(".json")) {
        prevData.slicePath = path
    }

    if (!prevData.slicePath && !prevData.texturePath) return

    textureMap.set(key, prevData)
}