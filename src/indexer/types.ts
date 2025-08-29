interface ElementMeta {
    filePath: string | undefined
    namespace: string
    variables: Variable[]
    controlSegments: string[]
}

interface Variable {
    name: string
    defaultValue: any
    isGlobal?: boolean
    overridesGlobal?: boolean
    overridesAncestors?: string[]
}

interface JSONUIElement {
    elementName: string
    referencingElement?: JSONUIElement | undefined
    parentElement?: JSONUIElement
    elementMeta: ElementMeta
    isDummy?: boolean
}

interface TextureSlice {
    texturePath?: string
    slicePath?: string
}