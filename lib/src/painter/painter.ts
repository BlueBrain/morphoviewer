import { Wgl2Camera } from "@/webgl2/camera/camera"
import { Wgl2Resources } from "@/webgl2/resources/resources"
import VERT from "./shader.vert"
import FRAG from "./shader.frag"
import { makeCapsuleAttributes } from "./capsule/capsule"
import { Segments } from "./segments"
import { Wgl2ControllerCameraOrbit } from "@/webgl2/controller/camera/orbit"
import { CellNodes } from "./nodes"
import { addVectors, vectorLength } from "@/webgl2/calc"
import { getDistancesTextureCanvas, getRegionsTextureCanvas } from "./textures"
import { CellNodeType } from "@/parser/swc"

export class SwcPainter {
    private gl: WebGL2RenderingContext | null = null
    private prg: WebGLProgram | null = null
    private vao: WebGLVertexArrayObject | null = null
    private texture: WebGLTexture | null = null
    private locations: { [name: string]: WebGLUniformLocation } = {}
    private instancesCount = 0
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
        private readonly camera: Wgl2Camera
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
        nodes.forEach(({ index, parent, type, radius, x, y, z }) => {
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
                    ? getRegionsTextureCanvas()
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
            locations["uniAspect"],
            gl.drawingBufferWidth / gl.drawingBufferHeight
        )
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

    private refresh() {
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
