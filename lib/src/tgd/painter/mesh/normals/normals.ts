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
 */
export class TgdPainterMeshNormals extends TgdPainter {
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
        gl.enable(gl.CULL_FACE)
        gl.cullFace(gl.BACK)
        prg.use()
        prg.uniformMatrix4fv("uniModelViewMatrix", camera.matrixModelView)
        prg.uniformMatrix4fv("uniProjectionMatrix", camera.matrixProjection)
        this.vao.bind()
        gl.drawElements(gl.TRIANGLES, this.elementsCount, this.elementsType, 0)
        this.vao.unbind()
    }

    delete(): void {
        this.vao.delete()
    }
}
