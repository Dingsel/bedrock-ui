import { readFileSync } from "fs"
import { removeComments } from "./utils"

/**
 * @type {Variable[]}
 */
export let globalVariables = []

/**
 * @param {string} filePath
 */
export function parseGlobalVarsFromFilePath(filePath) {
    const fileString = removeComments(readFileSync(filePath).toString())

    try {
        const json = JSON.parse(fileString)
        globalVariables = Object.entries(json).filter(([key]) => key.startsWith("$")).map(([name, defaultValue]) => ({
            name,
            defaultValue,
            isGlobal: true
        }));
    } catch (error) {
        console.warn("Failed to parse global variables", error)
    }
}