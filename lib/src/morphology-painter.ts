import { SwcPainter } from "./painter"
import { Grid } from "./painter/grid"
import { CellNodes } from "./painter/nodes"
import { parseSwc } from "./parser/swc"
import { ColoringType } from "./types"
import { Wgl2Camera } from "./webgl2/camera/camera"
import { Wgl2ControllerCameraOrbit } from "./webgl2/controller/camera/orbit"
import { Wgl2Resources } from "./webgl2/resources/resources"

export class MorphologyPainter {
    private _swc: string | null = null
    private _canvas: HTMLCanvasElement | null = null
    private nodes: CellNodes | null = null
    private paintingIsScheduled = false
    private painter: SwcPainter | null = null
    private grid: Grid | null = null
    private readonly _camera: Wgl2Camera
    private readonly orbiter: Wgl2ControllerCameraOrbit
    private _colorBy: ColoringType = "section"
    private _radiusType: number = 0
    private _radiusMultiplier: number = 1

    constructor() {
        this._camera = new Wgl2Camera()
        this.orbiter = new Wgl2ControllerCameraOrbit(this._camera, {
            onChange: this.paint,
        })
    }

    resetCamera() {
        this._camera.facePosZ()
        const { nodes } = this
        if (nodes) {
            const [sx, sy, sz] = nodes.bbox
            this._camera.distance.set(sz + Math.max(sx, sy))
        }
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

        this._camera.removeEventListener("change", this.paint)
        this.orbiter.detach()
        if (canvas) {
            this.orbiter.attach(canvas)
            this._camera.addEventListener("change", this.paint)
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
            console.log(nodes.tree)
            nodes.computeDistancesFromSoma()
            this.nodes = nodes
            this.init()
        }
    }

    public readonly paint = () => {
        if (this.paintingIsScheduled) return

        window.requestAnimationFrame(this.actualPaint)
    }

    private readonly actualPaint = (time: number) => {
        this.paintingIsScheduled = false
        this.grid?.paint()
        this.painter?.paint(time)
    }

    private init() {
        const { canvas, nodes } = this
        if (!canvas || !nodes) return

        if (this.painter) this.painter.cleanUp()

        const camera = this._camera
        const [x, y, z] = nodes.center
        const [sx, sy, sz] = nodes.bbox
        camera.target.set([x, y, z])
        camera.distance.set(sz + Math.max(sx, sy))
        const gl = canvas.getContext("webgl2")
        if (!gl) throw Error("Unable to create WebGL2 context!")

        const res = new Wgl2Resources(gl)
        this.painter = new SwcPainter(res, nodes, camera)
        this.grid = new Grid(res, camera)
    }
}
