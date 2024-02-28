import { TgdProgram, TgdTexture2D } from "@tgd/types"
import { TgdContext } from "@tgd/context"
import { TgdPainter } from "@tgd/painter/painter"
import { TgdDataset } from "@tgd/dataset/dataset"
import { TgdVertexArray } from "@tgd/vao"

import VERT from "./filter.vert"
import FRAG from "./filter.frag"

export interface TgdPainterFilterOptions {
    /**
     * Default value:
     * ```
     * return texture(uniTexture, varUV);
     * ```
     */
    fragShader?: string
    texture: TgdTexture2D | { texture: TgdTexture2D }
    z?: number
}

export class TgdPainterFilter extends TgdPainter {
    public texture: TgdTexture2D | { texture: TgdTexture2D }
    public z = 0

    private readonly program: TgdProgram
    private readonly vao: TgdVertexArray

    constructor(
        private readonly context: TgdContext,
        options: TgdPainterFilterOptions
    ) {
        super()
        this.z = options.z ?? 0
        this.texture = options.texture
        this.program = context.programs.create({
            vert: VERT,
            frag: `${FRAG}
${options.fragShader ?? "return texture(uniTexture, varUV);"}
}`,
        })
        const dataset = new TgdDataset({
            attPoint: "vec2",
            attUV: "vec2",
        })
        dataset.set(
            "attPoint",
            new Float32Array([-1, +1, +1, +1, -1, -1, +1, -1])
        )
        dataset.set("attUV", new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]))
        this.vao = context.createVAO(this.program, [dataset])
    }

    delete(): void {
        const { vao } = this
        vao.delete()
    }

    paint(): void {
        const { gl } = this.context
        const { vao, program, texture, z } = this
        program.use()
        program.uniform1f("uniZ", z)
        extractTexture(texture).activate(program, "uniTexture")
        vao.bind()
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
}

function extractTexture(
    data: TgdTexture2D | { texture: TgdTexture2D }
): TgdTexture2D {
    return isTgdTexture2D(data) ? data : data.texture
}

function isTgdTexture2D(data: unknown): data is TgdTexture2D {
    if (!data) return false
    if (typeof data !== "object") return false
    const { glTexture } = data as Record<string, unknown>
    return glTexture instanceof WebGLTexture
}
