import {
    TgdCamera,
    TgdContext,
    TgdDataset,
    TgdPainter,
    TgdProgram,
    TgdVec4,
    TgdVertexArray,
} from "@tgd"

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
    private readonly camera: TgdCamera
    private readonly prg: TgdProgram
    private readonly vao: TgdVertexArray
    private readonly count: number
    private start = 0
    private len = 0
    private readonly stack: Array<[number, number]> = []

    constructor(
        private readonly context: TgdContext,
        private readonly data: Float32Array
    ) {
        super()
        this.camera = context.camera
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
        this.start = 0
        this.len = this.count
        context.inputs.keyboard.eventKeyPress.addListener(this.handleKeyPress)
    }

    private readonly handleKeyPress = (evt: KeyboardEvent) => {
        const { start, len, context } = this
        const a = start
        const b = a + len
        const m = Math.round((a + b) / 2)
        switch (evt.key) {
            case "ArrowLeft":
                this.len = m - a
                this.context.paint()
                this.stack.push([this.start, this.len])
                break
            case "ArrowRight":
                this.start = m
                this.len = b - m
                this.context.paint()
                this.stack.push([this.start, this.len])
                break
            case "ArrowUp":
                // eslint-disable-next-line no-case-declarations
                const item = this.stack.pop()
                if (item) {
                    const [x, y] = item
                    this.start = x
                    this.len = y
                    this.context.paint()
                }
                break
            case " ":
                for (let i = 0; i < this.len; i++) {
                    const k = 3 * (i + this.start)
                    console.log(
                        `(${this.data[k + 0]}, ${this.data[k + 1]}, ${
                            this.data[k + 2]
                        })`
                    )
                }
                // eslint-disable-next-line no-case-declarations
                const { camera } = context
                camera.matrixModelView.debug("ModelView:")
                console.log(JSON.stringify([...camera.matrixModelView]))
                camera.matrixProjection.debug("Projection:")
                console.log(JSON.stringify([...camera.matrixProjection]))
                console.log("Screen size:", context.width, context.height)
                break
            default:
                console.log("🚀 [cloud-painter] evt.key = ", evt.key) // @FIXME: Remove this line written on 2024-02-20 at 11:58
        }
    }

    public readonly paint = () => {
        const { gl, prg, camera } = this
        camera.screenWidth = gl.drawingBufferWidth
        camera.screenHeight = gl.drawingBufferHeight
        prg.use()
        gl.enable(gl.DEPTH_TEST)
        gl.clearDepth(1)
        gl.depthFunc(gl.LESS)
        gl.depthMask(true)
        gl.depthRange(0, 1)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.disable(gl.BLEND)
        prg.uniformMatrix4fv("uniModelViewMatrix", camera.matrixModelView)
        prg.uniformMatrix4fv("uniProjectionMatrix", camera.matrixProjection)
        const size = this.radius * camera.zoom
        prg.uniform1f("uniSize", size)
        prg.uniform4fv("uniColor", this.color)
        this.vao.bind()
        // gl.drawArrays(gl.POINTS, 0, this.count)
        gl.drawArrays(gl.POINTS, this.start, this.len)
        this.vao.unbind()
    }

    delete(): void {
        this.vao.delete()
    }
}
