import { readFileSync } from "fs"
import { removeComments } from "./utils"

/**
 * @type {string[]}
 */
export let globalVariables = []

/**
 * @param {string} filePath
 */
export function parseGlobalVarsFromFilePath(filePath) {
    const fileString = removeComments(readFileSync(filePath).toString())

    try {
        const json = JSON.parse(fileString)
        globalVariables = Object.keys(json).filter(x => x.startsWith("$"))
    } catch (error) {
        console.warn("Failed to parse global variables", error)
    }
}