import Colors from "@/colors"
import { Wgl2CameraOrthographic } from "@/webgl2/camera"
import { Wgl2Resources } from "@/webgl2/resources/resources"
import { makeCapsuleAttributes } from "./capsule/capsule"
import { CellNodes } from "./nodes"
import { Segments } from "./segments"
import FRAG from "./shader.frag"
import VERT from "./shader.vert"
import { getDistancesTextureCanvas, getRegionsTextureCanvas } from "./textures"

export class SwcPainter {
    public minRadius = 1.5

    private colors: Colors | undefined
    private previousBackgroundColor = ""
    private readonly gl: WebGL2RenderingContext
    private readonly prg: WebGLProgram
    private readonly vao: WebGLVertexArrayObject
    private readonly texture: WebGLTexture
    private readonly locations: { [name: string]: WebGLUniformLocation }
    private readonly instancesCount: number
    private _radiusMultiplier = 1
    private readonly averageRadius: number
    /**
     * - 0: Variable radius.
     * - 1: Constant radius.
     * But we can be in between if we want to mix both types.
     */
    private _radiusType = 0
    private _colorBy: "section" | "distance" = "section"
    private textureIsOutOfDate = true
    private readonly observer: ResizeObserver
    private readonly canvas: HTMLCanvasElement

    constructor(
        private readonly resources: Wgl2Resources,
        nodes: CellNodes,
        private readonly camera: Wgl2CameraOrthographic
    ) {
        const { gl } = resources
        this.gl = gl
        this.observer = new ResizeObserver(this.handleResize)
        const canvas = gl.canvas
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw Error(
                "This painter works only with a real HTMLCanvasElement!"
            )
        }

        this.canvas = canvas
        this.observer.observe(canvas)
        this.resources = resources
        this.averageRadius = nodes.averageRadius
        const prg = resources.createProgram({
            vert: VERT,
            frag: FRAG,
        })
        this.prg = prg
        this.locations = resources.getUniformsLocations(prg)
        const { attributes: capsule, elements } = makeCapsuleAttributes()
        const segments = new Segments(nodes)
        nodes.forEach(({ index, parent }) => {
            if (parent < 0) return

            segments.addSegment(index, parent)
        })
        this.instancesCount = segments.count
        const instances = segments.makeAttributes()
        this.vao = resources.createVAO(
            prg,
            capsule,
            instances,
            new Uint8Array(elements)
        )
        gl.clearColor(1, 1, 1, 1)
        this.texture = createTexture(gl)
    }

    get colorBy() {
        return this._colorBy
    }
    set colorBy(value: "section" | "distance") {
        if (value === this._colorBy) return

        this._colorBy = value
        this.textureIsOutOfDate = true
        this.refresh()
    }

    get radiusType() {
        return this._radiusType
    }
    set radiusType(value: number) {
        if (value === this._radiusType) return

        this._radiusType = value
        this.refresh()
    }

    get radiusMultiplier() {
        return this._radiusMultiplier
    }
    set radiusMultiplier(value: number) {
        if (this._radiusMultiplier === value) return

        this._radiusMultiplier = value
        this.refresh()
    }

    public readonly paint = (_time: number) => {
        const radiusVariable = 1 - this._radiusType
        const radiusConstant = this._radiusType
        const { gl, camera, locations, textureIsOutOfDate, texture, colorBy } =
            this
        if (!gl) return

        camera.viewport.width = gl.drawingBufferWidth
        camera.viewport.height = gl.drawingBufferHeight
        gl.useProgram(this.prg)
        if (texture && textureIsOutOfDate) {
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                colorBy === "section"
                    ? getRegionsTextureCanvas(this.colors)
                    : getDistancesTextureCanvas()
            )
            this.textureIsOutOfDate = false
        }
        camera.setUniforms(
            gl,
            locations["uniModelViewMatrix"],
            locations["uniProjectionMatrix"]
        )
        gl.uniform1f(
            locations["uniMinRadius"],
            (0.5 *
                (this.minRadius * (camera.height.get() * camera.zoom.get()))) /
                camera.viewport.height
        )
        // gl.uniform1f(locations["uniMinRadius"], camera.zoom.get() * 0.0)
        gl.enable(gl.DEPTH_TEST)
        gl.clearDepth(1)
        gl.depthFunc(gl.LESS)
        gl.depthMask(true)
        gl.depthRange(0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.bindVertexArray(this.vao)
        gl.uniform1f(
            locations["uniRadiusMultiplier"],
            this._radiusMultiplier * radiusVariable
        )
        gl.uniform1f(
            locations["uniRadiusAdditioner"],
            this.averageRadius * this._radiusMultiplier * radiusConstant
        )
        gl.uniform1f(locations["uniLightness"], 1)
        gl.uniform1f(locations["uniZFight"], 0)
        gl.uniform1f(locations["uniOutline"], 1)
        gl.drawElementsInstanced(
            gl.TRIANGLES,
            16 * 3,
            gl.UNSIGNED_BYTE,
            0,
            this.instancesCount
        )
        // Outlines.
        gl.uniform1f(locations["uniOutline"], 1.2)
        gl.uniform1f(locations["uniLightness"], 0)
        gl.uniform1f(locations["uniZFight"], 1)
        gl.drawElementsInstanced(
            gl.TRIANGLES,
            16 * 3,
            gl.UNSIGNED_BYTE,
            0,
            this.instancesCount
        )
    }

    cleanUp() {
        this.resources.cleanUp()
        this.observer.unobserve(this.canvas)
    }

    resetColors(colors: Colors) {
        this.textureIsOutOfDate = true
        this.colors = colors
        this.setBackgroundColor()
        this.refresh()
    }

    private readonly setBackgroundColor = () => {
        const { colors } = this
        if (!colors) return

        const color = colors.background
        if (color === this.previousBackgroundColor) return

        const canvas = document.createElement("canvas")
        canvas.width = 1
        canvas.height = 1
        const ctx = canvas.getContext("2d")
        if (!ctx) throw Error("Unable to create 2D context!")

        ctx.fillStyle = color
        ctx.fillRect(0, 0, 1, 1)
        const bitmap = ctx.getImageData(0, 0, 1, 1)
        const [red, green, blue, alpha] = bitmap.data
        const f = 1 / 255
        this.gl?.clearColor(red * f, green * f, blue * f, alpha * f)
        this.previousBackgroundColor = color
    }

    public readonly refresh = () => {
        window.requestAnimationFrame(this.paint)
    }

    private readonly handleResize: ResizeObserverCallback = () => {
        const { canvas, gl } = this
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        canvas.width = w
        canvas.height = h
        gl?.viewport(0, 0, w, h)
        this.refresh()
    }
}

function createTexture(gl: WebGL2RenderingContext): WebGLTexture {
    const texture = gl.createTexture()
    if (!texture) throw Error("Unable to create a WebGLTexture!")

    gl.activeTexture(gl.TEXTURE0 + 0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    return texture
}
