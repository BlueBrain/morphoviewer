import {
    TgdContext,
    TgdDataset,
    TgdMeshData as TgdMeshData,
    TgdPainter,
    TgdProgram,
    TgdVertexArray,
} from "@tgd"

import FRAG from "./shader.frag"
import VERT from "./shader.vert"

/**
 * Render a totaly opaque black and white mesh
 * with ghost material.
 * This is like a stamp, because we will need to "apply" it
 * on the final renderbuffer to get transparency and color.
 */
export class StampPainter extends TgdPainter {
    private readonly prg: TgdProgram
    private readonly vao: TgdVertexArray
    private readonly elementsType: number
    private readonly elementsCount: number

    constructor(private readonly context: TgdContext, mesh: TgdMeshData) {
        super()
        const { attPosition, attNormal, elements, count, type } = mesh
        if (!attNormal) {
            throw Error("This mesh has no normal!")
        }

        const prg = context.programs.create({
            vert: VERT,
            frag: FRAG,
        })
        const dataset = new TgdDataset({
            attPosition: "vec3",
            attNormal: "vec3",
        })
        dataset.set("attPosition", attPosition)
        dataset.set("attNormal", attNormal)
        this.prg = prg
        this.vao = context.createVAO(prg, [dataset], elements)
        this.elementsType = context.gl[type]
        this.elementsCount = count
    }

    public readonly paint = () => {
        const { context, prg } = this
        const { gl, camera } = context
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

    delete(): void {
        this.vao.delete()
    }
}
