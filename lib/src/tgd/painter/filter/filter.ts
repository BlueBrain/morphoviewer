import { TgdProgram, TgdTexture2D } from "@tgd/types"
import { TgdContext } from "@tgd/context"
import { TgdPainter } from "@tgd/painter/painter"
import { TgdDataset } from "@tgd/dataset/dataset"
import { TgdVertexArray } from "@tgd/vao"

import { TgdFilter } from "@tgd/filter"
import { TgdShaderVertex } from "@tgd/shader/vertex"
import { TgdShaderFragment } from "@tgd/shader/fragment"

export interface TgdPainterFilterOptions {
    filters: TgdFilter[]
    texture: TgdTexture2D
    z?: number
}

export class TgdPainterFilter extends TgdPainter {
    public texture: TgdTexture2D
    public z = 0

    private readonly programs: TgdProgram[]
    private readonly filters: TgdFilter[]
    private readonly program: TgdProgram
    private readonly filter: TgdFilter
    private readonly vao: TgdVertexArray

    constructor(
        private readonly context: TgdContext,
        options: TgdPainterFilterOptions
    ) {
        super()
        this.z = options.z ?? 0.9999
        this.texture = options.texture
        this.filters = options.filters
        if (this.filters.length < 1) {
            throw Error(
                `[TgdPainterFilter] filters is expected to have at least one element!`
            )
        }

        this.programs = options.filters.map(filter => {
            const vert = new TgdShaderVertex({
                attributes: {
                    attPoint: "vec2",
                    attUV: "vec2",
                },
                varying: {
                    varUV: "vec2",
                },
                uniforms: {
                    uniZ: "float",
                },
                mainCode: [
                    "varUV = attUV;",
                    "gl_Position = vec4(",
                    ["attPoint,", "uniZ,", "1.0"],
                    ")",
                ],
            }).code
            const frag = new TgdShaderFragment({
                uniforms: {
                    uniWidth: "float",
                    uniHeight: "float",
                    ...filter.uniforms,
                },
            }).code
            return context.programs.create({ vert, frag })
        })
        this.filter = this.filters.pop() as TgdFilter
        this.program = this.programs.pop() as TgdProgram
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

    paint(time: number): void {
        const { context, vao, program, filter, texture, z } = this
        const { gl } = context
        program.use()
        program.uniform1f("uniZ", z)
        filter.setUniforms(program, time)
        texture.activate(program, "uniTexture")
        vao.bind()
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
}
