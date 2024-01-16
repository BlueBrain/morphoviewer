import { parseWavefront } from "@/parser/wavefront"
import { Wgl2Attributes } from "@/webgl2/attributes"
import { Wgl2FactoryMesh } from "@/webgl2/factory/mesh"

export function waveFrontParser(content: string): {
    attributes: Wgl2Attributes
    elements: Uint16Array | Uint32Array
} {
    const { vertices, triangles } = parseWavefront(content)
    const factory = new Wgl2FactoryMesh(vertices, triangles)
    return factory.getData()
}
