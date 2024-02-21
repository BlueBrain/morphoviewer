import {
    TgdTexture2D,
    TgdCamera,
    TgdCameraPerspective,
    TgdContext,
    TgdDataset,
    TgdPainter,
    TgdProgram,
    TgdVertexArray,
    tgdCreateCanvasWithContext2D,
} from "@tgd"

import VERT from "./shader.vert"
import FRAG from "./shader.frag"

export class TipsPainter extends TgdPainter {
    private readonly texture: TgdTexture2D
    private readonly prg: TgdProgram
    private readonly vao: TgdVertexArray

    constructor(private readonly context: TgdContext) {
        super()
        const camera = new TgdCameraPerspective()
        context.camera = camera
        camera.distance = 4
        camera.x = 0
        camera.y = 0
        camera.z = 0
        camera.fovy = Math.PI / 4
        camera.near = 1e-6
        camera.far = camera.distance * 2
        this.texture = context.textures2D.create({
            minFilter: "LINEAR",
            magFilter: "LINEAR",
        })
        this.setTips()
        const data = new TgdDataset({
            attPos: "vec3",
            attUV: "vec2",
        })
        // prettier-ignore
        data.set("attPos", new Float32Array([
             1,  0,  0,
             0,  1,  0,
             0,  0,  1,
            -1,  0,  0,
             0, -1,  0,
             0,  0, -1,
        ]))
        const X = 1 / 3
        const Y = 1 / 2
        // prettier-ignore
        data.set("attUV", new Float32Array([
              0, 0,
              X, 0,
            2*X, 0,
              0, Y,
              X, Y,
            2*X, Y,
        ]))
        const prg = context.programs.create({ vert: VERT, frag: FRAG })
        const vao = context.createVAO(prg, [data])
        this.prg = prg
        this.vao = vao
    }

    updateOrientationFrom(camera: TgdCamera) {
        const { context } = this
        context.camera.copyOrientationFrom(camera)
        context.paint()
    }

    delete(): void {
        this.vao.delete()
    }

    paint(): void {
        const { context, prg, vao } = this
        const { gl, camera } = context
        prg.use()
        this.texture.activate(prg, "uniTexture")
        prg.uniform1f("uniScreenHeight", context.height)
        prg.uniformMatrix4fv("uniModelViewMatrix", camera.matrixViewModel)
        prg.uniformMatrix4fv("uniProjectionMatrix", camera.matrixProjection)
        vao.bind()
        gl.drawArrays(gl.POINTS, 0, 6)
    }

    setTips() {
        const SIZE = 256
        const { canvas, ctx } = tgdCreateCanvasWithContext2D(SIZE * 3, SIZE * 2)
        paintDisk(ctx, 0, 0, SIZE, "X", "#f00", "#fff")
        paintDisk(ctx, 1, 0, SIZE, "Y", "#0f0", "#000")
        paintDisk(ctx, 2, 0, SIZE, "Z", "#00f", "#fff")
        paintDisk(ctx, 0, 1, SIZE, "", "#f00", "#500")
        paintDisk(ctx, 1, 1, SIZE, "", "#0f0", "#050")
        paintDisk(ctx, 2, 1, SIZE, "", "#00f", "#005")
        this.texture.loadImage(canvas)
    }
}

function paintDisk(
    ctx: CanvasRenderingContext2D,
    col: number,
    row: number,
    size: number,
    text: string,
    colorBack: string,
    colorText = "#fff"
) {
    const x = (col + 0.5) * size
    const y = (row + 0.5) * size
    const r = size * 0.45
    ctx.fillStyle = colorBack
    ctx.beginPath()
    ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI)
    ctx.fill()
    if (text) {
        ctx.font = `bold ${size * 0.5}px sans-serif`
        ctx.fillStyle = colorText
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(text, x, y)
    } else {
        ctx.fillStyle = colorText
        ctx.beginPath()
        ctx.ellipse(x, y, r * 0.8, r * 0.8, 0, 0, 2 * Math.PI)
        ctx.fill()
    }
}
