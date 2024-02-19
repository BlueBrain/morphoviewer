import { TgdContext, TgdPainterSegments } from "@tolokoban/tgd"

import { ColorsInterface } from "@/colors"
import { CellNodes } from "./nodes"
import { getDistancesTextureCanvas, getRegionsTextureCanvas } from "./textures"
import { makeData } from "./factory"

export class SwcPainter extends TgdPainterSegments {
    public minRadius = 1.5

    private colors: ColorsInterface | undefined
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

    constructor(context: TgdContext, nodes: CellNodes) {
        super(context, makeData(nodes))
        this.averageRadius = 1
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

    public readonly paint = (time: number, delay: number) => {
        // const radiusVariable = 1 - this._radiusType
        // const radiusConstant = this._radiusType
        this.updateTextureIfNeeded()
        this.light = 1
        this.shiftZ = 0
        super.paint(time, delay)
        const radiusMultiplier = this.radiusMultiplier
        this.radiusMultiplier *= 1.5
        this.light = 0.5
        this.shiftZ = 0.5
        super.paint(time, delay)
        this.radiusMultiplier = radiusMultiplier
    }

    private updateTextureIfNeeded() {
        const { colorTexture, colorBy, textureIsOutOfDate } = this
        if (textureIsOutOfDate) {
            colorTexture.loadImage(
                colorBy === "section"
                    ? getRegionsTextureCanvas(this.colors)
                    : getDistancesTextureCanvas()
            )
            this.textureIsOutOfDate = false
        }
    }

    resetColors(colors: ColorsInterface) {
        this.textureIsOutOfDate = true
        this.colors = colors
        this.refresh()
    }

    public readonly refresh = () => {
        this.context.paint()
    }
}
