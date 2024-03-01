import {
    TgdContext,
    TgdDataset,
    TgdPainter,
    TgdProgram,
    TgdVec4,
    TgdVertexArray,
    TgdTexture2D,
} from "@tgd"

import FRAG from "./shader.frag"
import VERT from "./shader.vert"

/**
 * Apply a black and white texture to the canvas
 * by giving it a color and adapted alpha.
 */
export class LayerPainter extends TgdPainter {
    public readonly color = new TgdVec4(1, 1, 1, 1)
    public texture: TgdTexture2D | null = null

    private readonly prg: TgdProgram
    private readonly vao: TgdVertexArray

    constructor(private readonly context: TgdContext) {
        super()
        const prg = context.programs.create({
            vert: VERT,
            frag: FRAG,
        })
        this.prg = prg
        const attributes = new TgdDataset({
            attPosition: "vec2",
        })
        attributes.set(
            "attPosition",
            new Float32Array([-1, -1, -1, +1, +1, -1, +1, +1])
        )
        this.vao = context.createVAO(prg, [attributes])
    }

    public readonly paint = () => {
        const { context, prg, texture, color } = this
        if (!texture) return

        const { gl } = context
        prg.use()
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.disable(gl.DEPTH_TEST)
        gl.depthMask(false)
        texture.activate(prg, "uniTexture")
        prg.uniform4fv("uniColor", color)
        this.vao.bind()
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        this.vao.unbind()
        gl.finish()
    }

    delete() {
        this.vao.delete()
    }
}
