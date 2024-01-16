import { parseWavefront } from "@/parser/wavefront"
import { Wgl2Attributes } from "@/webgl2/attributes"
import { WavefrontCapsuleContent } from "./object"
import { flattenVec3IntoUint8Array } from "@/webgl2/array"

export function makeCapsuleAttributes(): {
    attributes: Wgl2Attributes
    elements: Uint8Array
} {
    const { vertices, triangles } = parseWavefront(WavefrontCapsuleContent)
    const attributes = new Wgl2Attributes({
        attCenter: 1, // 0 or 1.
        attOffset: 2, // Vector of length 1.
    })
    const centers: number[] = []
    const offsets: number[] = []
    // We ignore Z because it must always be 0.
    for (const [x, y] of vertices) {
        const top = y > 0
        centers.push(top ? 1 : 0)
        offsets.push(x, y - (top ? 1 : -1))
    }
    attributes.set("attCenter", new Float32Array(centers))
    attributes.set("attOffset", new Float32Array(offsets))
    // prettier-ignore
    return {
        attributes,
        elements: flattenVec3IntoUint8Array(triangles)
    }
}
