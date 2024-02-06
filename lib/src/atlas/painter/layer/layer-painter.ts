import { Wgl2Resources } from "@/webgl2/resources/resources"

import FRAG from "./shader.frag"
import VERT from "./shader.vert"
import { Wgl2Attributes } from "@/webgl2/attributes"
import { Wgl2Vector4 } from "@/webgl2/types"

/**
 * Apply a black and white texture to the canvas
 * by giving it a color and adapted alpha.
 */
export class LayerPainter {
    private readonly gl: WebGL2RenderingContext
    private readonly prg: WebGLProgram
    private readonly vao: WebGLVertexArrayObject
    private readonly locations: { [name: string]: WebGLUniformLocation }

    constructor(resources: Wgl2Resources) {
        this.gl = resources.gl
        const prg = resources.createProgram({
            vert: VERT,
            frag: FRAG,
        })
        this.prg = prg
        this.locations = resources.getUniformsLocations(prg)
        const attributes = new Wgl2Attributes({
            attPosition: 2,
        })
        attributes.set(
            "attPosition",
            new Float32Array([-1, -1, -1, +1, +1, -1, +1, +1])
        )
        this.vao = resources.createVAO(prg, attributes)
    }

    public readonly paint = (
        texture: WebGLTexture,
        color: Wgl2Vector4,
        smoothness: number,
        highlight: number
    ) => {
        const { gl, locations } = this
        gl.useProgram(this.prg)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.disable(gl.DEPTH_TEST)
        gl.depthMask(false)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform4fv(locations["uniColor"], color)
        gl.uniform1f(locations["uniSmoothness"], smoothness)
        gl.uniform1f(locations["uniHighlight"], highlight)
        gl.bindVertexArray(this.vao)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
}
