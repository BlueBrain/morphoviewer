import { TgdDataset } from "@tgd"

import { parseWavefrontPositionsOnly } from "@/parser/wavefront"
import { WavefrontCapsuleContent } from "./object"

export function makeCapsuleAttributes(): {
    attributes: TgdDataset<{
        attCenter: "float" // 0 or 1.
        attOffset: "vec2" // Vector of length 1.
    }>
    elements: Uint8Array
} {
    const { dataset, elements } = parseWavefrontPositionsOnly(
        WavefrontCapsuleContent
    )
    const attributes = new TgdDataset({
        attCenter: "float", // 0 or 1.
        attOffset: "vec2", // Vector of length 1.
    })
    const centers: number[] = []
    const offsets: number[] = []
    const accessor = dataset.getAttribAccessor("attPosition")
    for (let i = 0; i < dataset.count; i++) {
        const x = accessor.get(i, 0)
        const y = accessor.get(i, 1)
        // We ignore Z because it must always be 0.
        const top = y > 0
        centers.push(top ? 1 : 0)
        offsets.push(x, y - (top ? 1 : -1))
    }
    attributes.set("attCenter", new Float32Array(centers))
    attributes.set("attOffset", new Float32Array(offsets))
    if (!(elements instanceof Uint8Array)) {
        throw Error("Too many vertices in the capsule template!")
    }

    // prettier-ignore
    return {
        attributes,
        elements
    }
}
