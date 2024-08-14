import { TgdContext, TgdPainterSegments } from "@tgd"

import { ColorsInterface } from "@/colors"
import { CellNodes } from "./nodes"
import { getDistancesTextureCanvas, getRegionsTextureCanvas } from "./textures"
import { makeData } from "./factory"

export class SwcPainter extends TgdPainterSegments {
    public minRadius = 1.5

    private colors: ColorsInterface | undefined
    private _colorBy: "section" | "distance" = "section"
    private textureIsOutOfDate = true
    private _somaVisible = true

    constructor(context: TgdContext, nodes: CellNodes) {
        super(context, makeData(nodes))
    }

    get somaVisible() {
        return this._somaVisible
    }

    set somaVisible(visible: boolean) {
        if (visible === this._somaVisible) return

        this._somaVisible = visible
        this.textureIsOutOfDate = true
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
        return this.radiusSwitch
    }
    set radiusType(value: number) {
        this.radiusSwitch = value
    }

    public readonly paint = (time: number, delay: number) => {
        // const radiusVariable = 1 - this._radiusType
        // const radiusConstant = this._radiusType
        this.updateTextureIfNeeded()
        this.light = 1
        this.shiftZ = 0
        super.paint(time, delay)
        // We now want to draw the outline.
        const radiusMultiplier = this.radiusMultiplier
        this.radiusMultiplier *= 1.5
        this.light = 0.25
        this.shiftZ = 0.5
        super.paint(time, delay)
        this.radiusMultiplier = radiusMultiplier
    }

    private updateTextureIfNeeded() {
        const { colorTexture, colorBy, textureIsOutOfDate } = this
        if (textureIsOutOfDate) {
            console.log(
                "🚀 [painter::updateTextureIfNeeded] this.colors = ",
                this.colors
            ) // @FIXME: Remove this line written on 2024-08-14 at 16:59
            colorTexture.loadImage(
                colorBy === "section"
                    ? getRegionsTextureCanvas(this.somaVisible, this.colors)
                    : getDistancesTextureCanvas(this.colors)
            )
            this.textureIsOutOfDate = false
        }
    }

    resetColors(colors: ColorsInterface) {
        console.log("🚀 [painter::resetColors] colors = ", colors) // @FIXME: Remove this line written on 2024-08-14 at 16:03
        this.textureIsOutOfDate = true
        this.colors = colors
        this.refresh()
    }

    public readonly refresh = () => {
        this.context.paint()
    }
}
