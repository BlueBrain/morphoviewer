import { TgdContext, TgdContextOptions } from "@tgd/context"

export interface TgdCanvasLandscapeOptions extends TgdContextOptions {
    canvas?: HTMLCanvasElement
    onReady(context: TgdContext): void
}

/**
 * The Landscape displays the orientation of an attached camera.
 * You can click one of the axis to force the camera to face it.
 */
export class TgdCanvasLandscape {
    private _canvas: HTMLCanvasElement | null = null
    private context: TgdContext | null = null

    constructor(private readonly options: TgdCanvasLandscapeOptions) {
        if (options.canvas) this.canvas = options.canvas
    }

    get canvas() {
        return this._canvas
    }
    set canvas(canvas: HTMLCanvasElement | null) {
        if (canvas === this._canvas) return

        this._canvas = canvas
        if (this.context) {
            this.context.destroy()
            this.context = null
        }
        if (!canvas) return

        const context = new TgdContext(canvas, {
            alpha: false,
            depth: true,
            antialias: true,
            name: "LandscapeCanvas",
            ...this.options,
        })
        this.context = context
        context.paint()
        this.options.onReady(context)
    }
}
