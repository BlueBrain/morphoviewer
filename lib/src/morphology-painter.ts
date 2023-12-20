import Colors from "./colors"
import { SwcPainter } from "./painter"
import { CellNodes } from "./painter/nodes"
import { parseSwc } from "./parser/swc"
import { ScalebarOptions, computeScalebarAttributes } from "./scalebar"
import { ColoringType } from "./types"
import { Wgl2CameraOrthographic } from "./webgl2/camera"
import { Wgl2ControllerCameraOrbit } from "./webgl2/controller/camera/orbit"
import { Wgl2Event } from "./webgl2/event"
import { Wgl2Resources } from "./webgl2/resources/resources"

export class MorphologyPainter {
    public readonly colors: Colors
    public readonly eventPixelScaleChange = new Wgl2Event<number>()

    /**
     * `pixelScale` depends on the camera height, the zoom and
     * the viewport height.
     * We memorize these values to send the `eventPixelScaleChange` when
     * needed.
     */
    private previousCameraHeight = -1
    private previousCameraZoom = -1
    private previousViewportHeight = -1

    private _swc: string | null = null
    private _canvas: HTMLCanvasElement | null = null
    private nodes: CellNodes | null = null
    private paintingIsScheduled = false
    private painter: SwcPainter | null = null
    private readonly _camera: Wgl2CameraOrthographic
    private readonly orbiter: Wgl2ControllerCameraOrbit
    private _colorBy: ColoringType = "section"
    private _radiusType: number = 0
    private _radiusMultiplier: number = 1

    constructor() {
        this._camera = new Wgl2CameraOrthographic()
        this.orbiter = new Wgl2ControllerCameraOrbit(this._camera, {
            onChange: this.paint,
        })
        this.colors = new Colors()
        this.colors.eventChange.addListener(this.handleColorsChange)
    }

    public readonly resetCamera = () => {
        const camera = this._camera
        camera.facePosZ()
        const { nodes } = this
        if (nodes) {
            const [sx, sy] = nodes.bbox
            const morphoWidth = 2 * Math.abs(sx)
            const morphoHeight = 2 * Math.abs(sy)
            const morphoRatio = morphoWidth / morphoHeight
            const canvasWidth = camera.viewport.width
            const canvasHeight = camera.viewport.height
            const canvasRatio = canvasWidth / canvasHeight
            const height =
                canvasRatio > morphoRatio
                    ? morphoHeight
                    : (morphoHeight * morphoRatio) / canvasRatio
            // We keep a margin of 5%
            camera.height.set(height * 1.05)
            camera.zoom.set(1)
        }
    }

    /**
     * @returns The real space dimension of a screen pixel.
     * This can be used to draw a scalebar.
     */
    get pixelScale() {
        const camera = this._camera
        return (
            (camera.height.get() * camera.zoom.get()) / camera.viewport.height
        )
    }

    computeScalebar(options: Partial<ScalebarOptions> = {}) {
        return computeScalebarAttributes(this.pixelScale, options)
    }

    get colorBy() {
        return this.painter?.colorBy ?? this._colorBy
    }
    set colorBy(value) {
        const { painter } = this
        this._colorBy = value
        if (painter) painter.colorBy = value
    }

    get radiusType() {
        return this.painter?.radiusType ?? this._radiusType
    }
    set radiusType(value) {
        const { painter } = this
        this._radiusType = value
        if (painter) painter.radiusType = value
    }

    get radiusMultiplier() {
        return this.painter?.radiusMultiplier ?? this._radiusMultiplier
    }
    set radiusMultiplier(value) {
        const { painter } = this
        this._radiusMultiplier = value
        if (painter) painter.radiusMultiplier = value
    }

    get canvas() {
        return this._canvas
    }
    set canvas(canvas: HTMLCanvasElement | null) {
        if (canvas === this._canvas) return

        this._camera.eventChange.removeListener(this.paint)
        this._camera.eventChange.removeListener(this.handlePixelScaleDispatch)
        this.orbiter.detach()
        if (canvas) {
            this.orbiter.attach(canvas)
            this._camera.eventChange.addListener(this.paint)
            this._camera.eventChange.addListener(this.handlePixelScaleDispatch)
        }
        this._canvas = canvas
        this.init()
    }

    get swc() {
        return this._swc
    }
    set swc(swc: string | null) {
        if (swc === this._swc) {
            // This content is already loaded.
            return
        }

        this._swc = swc
        this.nodes = null
        if (swc) {
            const nodes = new CellNodes(parseSwc(swc))
            nodes.computeDistancesFromSoma()
            this.nodes = nodes
            this.init()
        }
    }

    public readonly paint = () => {
        if (this.paintingIsScheduled) return

        this.paintingIsScheduled = true
        window.requestAnimationFrame(this.actualPaint)
    }

    private readonly actualPaint = (time: number) => {
        this.paintingIsScheduled = false
        this.painter?.paint(time)
    }

    private readonly handleColorsChange = () => {
        this.painter?.resetColors(this.colors)
    }

    private init() {
        const { canvas, nodes } = this
        if (!canvas || !nodes) return

        if (this.painter) this.painter.cleanUp()

        const camera = this._camera
        const [x, y, z] = nodes.center
        const [sx, sy, sz] = nodes.bbox
        camera.near.set(1e-6)
        camera.far.set(Math.max(sx, sy, sz) * 1e3)
        camera.target.set([x, y, z])
        camera.height.set(sz + Math.max(sx, sy))
        window.requestAnimationFrame(this.resetCamera)
        const gl = canvas.getContext("webgl2")
        if (!gl) throw Error("Unable to create WebGL2 context!")

        const res = new Wgl2Resources(gl)
        this.painter = new SwcPainter(res, nodes, camera)
        if (this.colors) this.painter.resetColors(this.colors)
    }

    private readonly handlePixelScaleDispatch = () => {
        console.log("handlePixelScaleDispatch")
        const camera = this._camera
        const cameraHeight = camera.height.get()
        const cameraZoom = camera.zoom.get()
        const viewportHeight = camera.viewport.height
        if (
            cameraHeight === this.previousCameraHeight &&
            cameraZoom === this.previousCameraZoom &&
            viewportHeight === this.previousViewportHeight
        ) {
            console.log("No change...")
            return
        }

        this.previousCameraHeight = cameraHeight
        this.previousCameraZoom = cameraZoom
        this.previousViewportHeight = viewportHeight
        this.eventPixelScaleChange.dispatch(this.pixelScale)
    }
}
