import { TgdProgram, TgdTextureCube, TgdTextureCubeOptions } from "@tgd/types"
import { TgdContext } from "@tgd/context"
import { TgdPainter } from "@tgd/painter/painter"
import { TgdDataset } from "@tgd/dataset/dataset"
import { TgdVertexArray } from "@tgd/vao"
import { TgdCameraPerspective } from "@tgd/camera"
import { TgdMat4 } from "@tgd/math"

import VERT from "./skybox.vert"
import FRAG from "./skybox.frag"

export type TgdPainterSkyboxOptions = TgdTextureCubeOptions & {
    camera?: TgdCameraPerspective
}

export class TgdPainterSkybox extends TgdPainter {
    public camera: TgdCameraPerspective

    private readonly texture: TgdTextureCube
    private readonly program: TgdProgram
    private readonly vao: TgdVertexArray
    private readonly matrix = new TgdMat4()
    private readonly tmpMat = new TgdMat4()

    constructor(
        private readonly context: TgdContext,
        options: TgdPainterSkyboxOptions
    ) {
        super()
        this.camera = options.camera ?? new TgdCameraPerspective()
        this.texture = context.texturesCube.create(options)
        this.program = context.programs.create({
            vert: VERT,
            frag: FRAG,
        })
        const dataset = new TgdDataset({
            attPoint: "vec2",
        })
        dataset.set(
            "attPoint",
            new Float32Array([-1, +1, +1, +1, -1, -1, +1, -1])
        )
        this.vao = context.createVAO(this.program, [dataset])
    }

    delete(): void {
        const { vao } = this
        vao.delete()
    }

    paint(): void {
        const { context, vao, program, texture } = this
        const { gl } = context

        program.use()
        program.uniformMatrix4fv("uniMatrix", this.matrix)
        texture.activate(program, "uniTexture")
        vao.bind()
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        // Compute matrix for the next frame.
        const { camera, matrix, tmpMat } = this
        if (camera !== context.camera) {
            camera.orientation = context.camera.orientation
        }
        matrix.from(camera.matrixProjection)
        tmpMat.fromMat3(camera.matrixModelView)
        tmpMat.m30 = 0
        tmpMat.m31 = 0
        tmpMat.m32 = 0
        tmpMat.m33 = 1
        tmpMat.m03 = 0
        tmpMat.m13 = 0
        tmpMat.m23 = 0
        matrix.multiply(tmpMat).invert()
    }
}
