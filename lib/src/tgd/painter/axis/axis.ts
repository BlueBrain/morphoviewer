import { TgdContext } from "@tgd/context"
import { TgdProgram } from "@tgd/types"
import { TgdPainter } from "@tgd/painter/painter"
import { TgdDataset } from "@tgd/dataset"
import { TgdVertexArray } from "@tgd/vao"
import { TgdVec4 } from "@tgd/math"

import VERT from "./axis.vert"
import FRAG from "./axis.frag"

export type TgdPainterAxisOptions = {
    x: number
    y: number
    z: number
    scale: number
}

export class TgdPainterAxis extends TgdPainter {
    private readonly vao: TgdVertexArray
    private readonly prg: TgdProgram
    private readonly translateAndScale: TgdVec4

    constructor(
        public readonly context: TgdContext,
        { x = 0, y = 0, z = 0, scale = 1 }: Partial<TgdPainterAxisOptions> = {}
    ) {
        super()
        const prg = context.programs.create({
            vert: VERT,
            frag: FRAG,
        })
        this.prg = prg
        const dataset = new TgdDataset({
            attPos: "vec3",
            attColor: "vec4",
        })
        // prettier-ignore
        dataset.set("attPos", new Float32Array([
            0, 0, 0, +1, +0, +0,
            0, 0, 0, +0, +1, +0,
            0, 0, 0, +0, +0, +1,
            0, 0, 0, -1, -0, -0,
            0, 0, 0, -0, -1, -0,
            0, 0, 0, -0, -0, -1,
        ]))
        const a = 1
        const b = 0.25
        // prettier-ignore
        dataset.set("attColor", new Float32Array([
            a, 0, 0, 1, a, 0, 0, 1,
            0, a, 0, 1, 0, a, 0, 1,
            0, 0, a, 1, 0, 0, a, 1,
            b, 0, 0, 1, b, 0, 0, 1,
            0, b, 0, 1, 0, b, 0, 1,
            0, 0, b, 1, 0, 0, b, 1,
        ]))
        this.vao = context.createVAO(prg, [dataset])
        this.translateAndScale = new TgdVec4(x, y, z, scale)
    }

    get x(): number {
        return this.translateAndScale.x
    }
    set x(v: number) {
        this.translateAndScale.x = v
    }

    get y(): number {
        return this.translateAndScale.y
    }
    set y(v: number) {
        this.translateAndScale.y = v
    }

    get z(): number {
        return this.translateAndScale.z
    }
    set z(v: number) {
        this.translateAndScale.z = v
    }

    get scale(): number {
        return this.translateAndScale.w
    }
    set scale(v: number) {
        this.translateAndScale.w = v
    }

    delete(): void {
        this.vao.delete()
    }

    paint(): void {
        const { context, prg, vao, translateAndScale } = this
        const { gl, camera } = context
        prg.use()
        prg.uniform4fv("uniTS", translateAndScale)
        prg.uniformMatrix4fv("uniModelViewMatrix", camera.matrixModelView)
        prg.uniformMatrix4fv("uniProjectionMatrix", camera.matrixProjection)
        vao.bind()
        gl.drawArrays(gl.LINES, 0, 12)
    }
}
