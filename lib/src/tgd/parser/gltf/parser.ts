import { TgdFormatGltf, assertTgdFormatGltf } from "../../types/gltf"

/**
 * @see https://www.khronos.org/files/gltf20-reference-guide.pdf
 */
// eslint-disable-next-line max-statements
export function parseGLB(data: ArrayBuffer): {
    gltf: TgdFormatGltf
    chunks: ArrayBuffer[]
} {
    const view = new DataView(data)
    const magicNumber = view.getUint32(0, true)
    if (magicNumber !== 0x46546c67) {
        throw Error("Invalid magic number for GLB file!")
    }
    const version = view.getUint32(4, true)
    if (version !== 2) {
        throw Error(
            `We support only version 2, but this file is in version ${version}!`
        )
    }
    const length = view.getUint32(8, true)
    let gltf = {} as TgdFormatGltf
    const chunks: ArrayBuffer[] = []
    let offset = 12
    while (offset < length) {
        const chunkLength = view.getUint32(offset, true)
        offset += 4
        const chunkType = view.getUint32(offset, true)
        offset += 4
        const chunkData = data.slice(offset, offset + chunkLength)
        offset += chunkLength
        if (chunkType === 0x4e4f534a) {
            // This is the JSON part.
            const json = new TextDecoder().decode(chunkData)
            try {
                const obj: unknown = JSON.parse(json)
                console.log(obj)
                assertTgdFormatGltf(obj)
                gltf = obj
            } catch (ex) {
                console.error("Unable to parse this JSON file:", json)
                console.error(ex)
                throw Error("Invalid JSON data in the chunk!")
            }
        } else if (chunkType === 0x004e4942) {
            chunks.push(chunkData)
        } else {
            throw Error(
                `We got an invalid chunk type: 0x${chunkType
                    .toString(16)
                    .padStart(8, "0")}!`
            )
        }
    }
    return { gltf, chunks }
}
