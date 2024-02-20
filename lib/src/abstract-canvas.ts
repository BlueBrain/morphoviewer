import {
    TgdCameraOrthographic,
    TgdContext,
    TgdControllerCameraOrbit,
    TgdEvent,
} from "@tgd"

import { ScalebarOptions, computeScalebarAttributes } from "./scalebar"
import { isFullScreen, toggleFullscreen } from "./webgl2/fullscreen"

export interface CanvasOptions extends WebGLContextAttributes {
    /**
     * If set to `false`, no gesture will change the camera position.
     * And you will need to manage this outside of the library by accessing
     * `AbstractPainter.camera` property.
     *
     * Default to `true`.
     */
    cameraControllerEnabled: boolean
    /**
     * Number of milliseconds the camera will keep moving after the end of the gesture.
     */
    inertia: number
}

export abstract class AbstractCanvas {
    public readonly eventPixelScaleChange = new TgdEvent<number>()
    public readonly eventMouseWheelWithoutCtrl = new TgdEvent<void>()

    /**
     * `pixelScale` depends on the camera height, the zoom and
     * the viewport height.
     * We memorize these values to send the `eventPixelScaleChange` when
     * needed.
     */
    private previousCameraHeight = -1
    private previousCameraZoom = -1
    private previousViewportHeight = -1

    protected readonly _camera = new TgdCameraOrthographic()
    protected readonly options: CanvasOptions
    public orbiter: TgdControllerCameraOrbit | null = null
    protected context: TgdContext | null = null

    private _canvas: HTMLCanvasElement | null = null

    constructor(options: Partial<CanvasOptions>) {
        this.options = {
            cameraControllerEnabled: true,
            inertia: 500,
            ...options,
        }
        this._camera.near = 1e-6
        this._camera.far = 1e6
    }

    refresh() {
        this.context?.paint()
    }

    toggleFullscreen(): Promise<boolean> {
        return toggleFullscreen(this._canvas)
    }

    /**
     * @param target The canvas (with 2D context) into which
     * we will paste the final snapshot.
     * The width and height attributes must be set, because they
     * will be used to generate the snapshot.
     */
    takeSnapshot(target: HTMLCanvasElement): boolean {
        const { context: resources, canvas } = this
        if (!resources || !canvas) {
            // We cannot yet generate any image.
            return false
        }

        const ctx = target.getContext("2d")
        if (!ctx) {
            throw Error(
                "[takeSnapshot] We cannot create a 2D context on the target canvas!"
            )
        }
        const savedWidth = canvas.width
        const savedHeight = canvas.height

        const { gl } = resources
        canvas.width = target.width
        canvas.height = target.height
        this.refresh()
        gl.flush()
        ctx.drawImage(canvas, 0, 0)
        canvas.width = savedWidth
        canvas.height = savedHeight
        return true
    }

    /**
     * @returns The real space dimension of a screen pixel.
     * This can be used to draw a scalebar.
     */
    get pixelScale() {
        const camera = this._camera
        return (camera.zoom * camera.spaceHeight) / camera.screenHeight
    }

    computeScalebar(options: Partial<ScalebarOptions> = {}) {
        return computeScalebarAttributes(this.pixelScale, options)
    }

    get camera() {
        return this._camera
    }

    get canvas() {
        return this._canvas
    }
    set canvas(canvas: HTMLCanvasElement | null) {
        if (canvas === this._canvas) return

        if (this.orbiter) {
            this.orbiter.enabled = false
            this.orbiter.eventZoomChange.removeListener(
                this.handlePixelScaleDispatch
            )
            this.orbiter.detach()
        }

        if (this.context) {
            this.context.destroy()
        }
        this._canvas = canvas
        if (canvas) {
            this.context = new TgdContext(canvas, {
                antialias: true,
                alpha: false,
                ...this.options,
                depth: true,
                preserveDrawingBuffer: true,
                premultipliedAlpha: true,
            })
            this.context.camera = this._camera
            this.context.inputs.pointer.inertia = 500
            const orbiter = new TgdControllerCameraOrbit(this.context)
            this.orbiter = orbiter
            orbiter.eventZoomChange.addListener(this.handlePixelScaleDispatch)
            this.init()
            this.context.paint()
        }
    }

    protected abstract init(): void

    private readonly handleMouseWheel = () => {
        const { context } = this
        if (!context) return

        const { keyboard } = context.inputs
        context.inputs.keyboard
        if (keyboard.isDown("Control")) return true
        if (isFullScreen(this._canvas)) return true
        this.eventMouseWheelWithoutCtrl.dispatch()
        return false
    }

    private readonly handlePixelScaleDispatch = () => {
        const camera = this._camera
        const spaceHeight = camera.spaceHeight
        const cameraZoom = camera.zoom
        const screenHeight = camera.screenHeight
        if (
            spaceHeight === this.previousCameraHeight &&
            cameraZoom === this.previousCameraZoom &&
            screenHeight === this.previousViewportHeight
        ) {
            return
        }

        this.previousCameraHeight = spaceHeight
        this.previousCameraZoom = cameraZoom
        this.previousViewportHeight = screenHeight
        this.eventPixelScaleChange.dispatch(this.pixelScale)
    }
}
