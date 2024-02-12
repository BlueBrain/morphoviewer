import Colors, { ColorsInterface } from "../colors"
import { SwcPainter } from "./painter"
import { CellNodes } from "./painter/nodes"
import { parseSwc } from "../parser/swc"
import { ScalebarOptions, computeScalebarAttributes } from "../scalebar"
import { CellNodeType, ColoringType } from "../types"
import { Wgl2Event } from "../webgl2/event"
import { AbstractPainter, PainterOptions } from "../abstract-painter"

export class MorphologyPainter extends AbstractPainter {
    public readonly colors: ColorsInterface
    public readonly eventColorsChange = new Wgl2Event<ColorsInterface>()

    private _maxDendriteLength = 0
    private _minRadius = 1
    private _swc: string | null = null
    private nodes: CellNodes | null = null
    private paintingIsScheduled = false
    private painter: SwcPainter | null = null
    private _colorBy: ColoringType = "section"
    private _radiusType: number = 0
    private _radiusMultiplier: number = 1

    constructor(options: Partial<PainterOptions> = {}) {
        super(options)
        const colors = new Colors()
        colors.eventChange.addListener(this.handleColorsChange)
        this.colors = colors
    }

    /**
     * Length of the longest neurite.
     */
    get maxDendriteLength() {
        return this._maxDendriteLength
    }

    hasSoma(): boolean {
        return this.hasNodeType(CellNodeType.Soma)
    }

    hasAxon(): boolean {
        return this.hasNodeType(CellNodeType.Axon)
    }

    hasApicalDendrite(): boolean {
        return this.hasNodeType(CellNodeType.ApicalDendrite)
    }

    hasBasalDendrite(): boolean {
        return this.hasNodeType(CellNodeType.BasalDendrite)
    }
    /**
     * Check if a type has been found in the current SWC file.
     */
    private hasNodeType(type: CellNodeType): boolean {
        const { nodes } = this
        if (!nodes) return false

        return nodes.nodeTypes.includes(type)
    }

    get minRadius() {
        return this.painter?.minRadius ?? this._minRadius
    }

    set minRadius(value: number) {
        if (this._minRadius === value) return

        this._minRadius = value
        if (this.painter) {
            this.painter.minRadius = value
            this.painter.refresh()
        }
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
    set colorBy(value: ColoringType) {
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
            this._maxDendriteLength = nodes.computeDistancesFromSoma()
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
        const { colors } = this
        this.painter?.resetColors(colors)
        this.eventColorsChange.dispatch({
            apicalDendrite: colors.apicalDendrite,
            axon: colors.axon,
            background: colors.background,
            basalDendrite: colors.basalDendrite,
            soma: colors.soma,
        })
    }

    protected init() {
        const { canvas, nodes, resources } = this
        if (!canvas || !nodes || !resources) return

        const camera = this._camera
        const [x, y, z] = nodes.center
        const [sx, sy, sz] = nodes.bbox
        camera.near.set(1e-6)
        camera.far.set(Math.max(sx, sy, sz) * 1e3)
        camera.target.set([x, y, z])
        camera.height.set(sz + Math.max(sx, sy))
        window.requestAnimationFrame(this.resetCamera)
        this.painter = new SwcPainter(resources, nodes, camera)
        this.painter.minRadius = this._minRadius
        if (this.colors) this.painter.resetColors(this.colors)
    }
}
