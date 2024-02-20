import {
    TgdContext,
    TgdDataset,
    TgdProgram,
    TgdVec4,
    TgdVertexArray,
} from "@tgd"

import FRAG from "./shader.frag"
import VERT from "./shader.vert"

/**
 * Apply a black and white texture to the canvas
 * by giving it a color and adapted alpha.
 */
export class LayerPainter {
    private readonly prg: TgdProgram
    private readonly vao: TgdVertexArray

    constructor(private readonly context: TgdContext) {
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

    public readonly paint = (
        texture: WebGLTexture,
        color: TgdVec4,
        smoothness: number,
        highlight: number
    ) => {
        const { context, prg } = this
        const { gl } = context
        prg.use()
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.disable(gl.DEPTH_TEST)
        gl.depthMask(false)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        prg.uniform4fv("uniColor", color)
        prg.uniform1f("uniSmoothness", smoothness)
        prg.uniform1f("uniHighlight", highlight)
        this.vao.bind()
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
}
