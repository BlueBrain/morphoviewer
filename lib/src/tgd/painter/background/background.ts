import { TgdProgram, TgdTexture2D } from "@tgd/types"
import { TgdContext } from "@tgd/context"
import { TgdPainter } from "../painter"
import { TgdDataset } from "@tgd/dataset/dataset"
import { TgdVertexArray } from "@tgd/vao"

import VERT from "./background.vert"
import FRAG from "./background.frag"

export interface TgdPainterBackgroundOptions {
    zoom: number
    x: number
    y: number
    z: number
}

export class TgdPainterBackground extends TgdPainter {
    public texture: TgdTexture2D

    private readonly program: TgdProgram
    private readonly vao: TgdVertexArray

    /**
     * With a zoom of **1**, the image will have the smaller size to cover
     * the whole scene.
     */
    public zoom = 1
    public x = 0
    public y = 0
    public z = 1

    constructor(
        private readonly context: TgdContext,
        texture: TgdTexture2D,
        {
            x = 0,
            y = 0,
            z = 1,
            zoom = 1,
        }: Partial<TgdPainterBackgroundOptions> = {}
    ) {
        super()
        this.x = x
        this.y = y
        this.z = z
        this.zoom = zoom
        this.texture = texture
        this.program = context.programs.create({
            vert: VERT,
            frag: FRAG,
        })
        const dataset = new TgdDataset({
            attPoint: "vec2",
            attUV: "vec2",
        })
        dataset.set(
            "attPoint",
            new Float32Array([-1, -1, +1, -1, -1, +1, +1, +1])
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
        const { vao, program, texture, zoom, x, y, z } = this
        program.use()
        const { width, height } = this.context
        const horizontal = texture.width * height > texture.height * width
        const scaleX = horizontal
            ? (texture.width * height) / (width * texture.height)
            : 1
        const scaleY = horizontal
            ? 1
            : (texture.height * width) / (height * texture.width)
        program.uniform2f("uniScale", scaleX, scaleY)
        program.uniform2f("uniScroll", x, y)
        program.uniform1f("uniZoom", 1 / zoom)
        program.uniform1f("uniZ", z)
        texture.activate(program, "uniTexture")
        vao.bind()
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
}
