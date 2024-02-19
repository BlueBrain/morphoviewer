import {
    TgdCameraOrthographic,
    TgdContext,
    TgdDataset,
    TgdPainter,
    TgdProgram,
    TgdVec4,
    TgdVertexArray,
} from "@tolokoban/tgd"

import FRAG from "./shader.frag"
import VERT from "./shader.vert"

/**
 * Render a totaly opaque black and white mesh
 * with ghost material.
 */
export class CloudPainter extends TgdPainter {
    public readonly color = new TgdVec4(1, 1, 1, 1)
    public radius = 10

    private readonly gl: WebGL2RenderingContext
    private readonly prg: TgdProgram
    private readonly vao: TgdVertexArray
    private readonly count: number

    constructor(
        context: TgdContext,
        data: Float32Array,
        private readonly camera: TgdCameraOrthographic
    ) {
        super()
        this.gl = context.gl
        const prg = context.programs.create({
            vert: VERT,
            frag: FRAG,
        })
        this.prg = prg
        const attributes = new TgdDataset({ attPosition: "vec3" })
        attributes.set("attPosition", data)
        this.vao = context.createVAO(prg, [attributes])
        this.count = Math.floor(data.length / 3)
    }

    public readonly paint = () => {
        const { gl, prg, camera } = this
        camera.screenWidth = gl.drawingBufferWidth
        camera.screenHeight = gl.drawingBufferHeight
        prg.use()
        gl.enable(gl.DEPTH_TEST)
        gl.disable(gl.BLEND)
        prg.uniformMatrix4fv("uniModelViewMatrix", camera.matrixViewModel)
        prg.uniformMatrix4fv("uniProjectionMatrix", camera.matrixProjection)
        const size = this.radius * camera.zoom
        prg.uniform1f("uniSize", size)
        prg.uniform4fv("uniColor", this.color)
        gl.clearDepth(1)
        gl.depthFunc(gl.LESS)
        gl.depthMask(true)
        gl.depthRange(0, 1)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        this.vao.bind()
        gl.drawArrays(gl.POINTS, 0, this.count)
    }

    delete(): void {
        this.vao.delete()
    }

    update(time: number, delay: number): void {}
}
