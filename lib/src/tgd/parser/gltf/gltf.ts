import { parseGLB } from "./parser"

export class TgdParserGLTransfertFormatBinary {
    constructor(content: ArrayBuffer) {
        try {
            const data = parseGLB(content)
            console.log("🚀 [gltf] data.gltf = ", data.gltf) // @FIXME: Remove this line written on 2024-03-01 at 14:21
            for (const chunk of data.chunks) {
                console.log("ArrayBuffer:", chunk.byteLength)
            }
        } catch (ex) {
            const message =
                ex instanceof Error ? ex.message : JSON.stringify(ex)
            throw Error(`[TgdParserGLTransfertFormatBinary] ${message}`)
        }
    }
}
