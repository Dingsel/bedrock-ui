interface ElementMeta {
    filePath: string | undefined
    namespace: string
    variables: string[]
    controlSegments: string[]
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