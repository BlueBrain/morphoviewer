import {
    TgdCameraOrthographic,
    TgdContext,
    TgdProgram,
    TgdVertexArray,
} from "@tgd"

import { AtlasMeshOptions } from "@/atlas/atlas-mesh"
import { parseWavefront } from "@/parser/wavefront"

import FRAG from "./shader.frag"
import VERT from "./shader.vert"

/**
 * Render a totaly opaque black and white mesh
 * with ghost material.
 */
export class MeshPainter {
    private readonly gl: WebGL2RenderingContext
    private readonly prg: TgdProgram
    private readonly vao: TgdVertexArray
    private readonly elementsType: number
    private readonly elementsCount: number

    constructor(context: TgdContext, wavefrontContent: string) {
        this.gl = context.gl
        const { dataset, elements, count, type } =
            parseWavefront(wavefrontContent)
        const prg = context.programs.create({
            vert: VERT,
            frag: FRAG,
        })
        this.prg = prg
        this.vao = context.createVAO(prg, [dataset], elements)
        this.elementsType = this.gl[type]
        this.elementsCount = count
    }

    public readonly paint = (
        camera: TgdCameraOrthographic,
        _options: AtlasMeshOptions,
        _time: number
    ) => {
        const { gl, prg } = this
        camera.screenWidth = gl.drawingBufferWidth
        camera.screenHeight = gl.drawingBufferHeight
        prg.use()
        prg.uniformMatrix4fv("uniModelViewMatrix", camera.matrixModelView)
        prg.uniformMatrix4fv("uniProjectionMatrix", camera.matrixProjection)
        gl.enable(gl.DEPTH_TEST)
        gl.clearDepth(1)
        gl.depthFunc(gl.LESS)
        gl.depthMask(true)
        gl.depthRange(0, 1)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        this.vao.bind()
        gl.drawElements(gl.TRIANGLES, this.elementsCount, this.elementsType, 0)
    }
}
