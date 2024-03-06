import {
    TgdCamera,
    TgdCameraOrthographic,
    TgdContext,
    TgdControllerCameraOrbit,
    TgdControllerCameraOrbitOptions,
    TgdEvent,
    tgdFullscreenTest,
    tgdFullscreenToggle,
} from "@tgd"

import { ScalebarOptions, computeScalebarAttributes } from "./scalebar"

export interface CanvasOptions extends WebGLContextAttributes {
    /**
     * If set to `null`, no gesture will change the camera position.
     * And you will need to manage this outside of the library by accessing
     * `AbstractPainter.camera` property.
     *
     * Default to `null`.
     */
    cameraController: Partial<TgdControllerCameraOrbitOptions> | null
    name: string
}

export abstract class AbstractCanvas {
    public readonly eventPixelScaleChange = new TgdEvent<number>()
    public readonly eventMouseWheelWithoutCtrl = new TgdEvent<void>()
    public readonly name: string

    private _camera: TgdCamera

    /**
     * `pixelScale` depends on the camera height, the zoom and
     * the viewport height.
     * We memorize these values to send the `eventPixelScaleChange` when
     * needed.
     */
    private previousCameraHeight = -1
    private previousCameraZoom = -1
    private previousViewportHeight = -1

    protected readonly options: CanvasOptions
    public orbiter: TgdControllerCameraOrbit | null = null
    protected context: TgdContext | null = null

    private _canvas: HTMLCanvasElement | null = null

    constructor(options: Partial<CanvasOptions>) {
        this.options = {
            cameraController: null,
            name: `AbstractCanvas`,
            ...options,
        }
        this.name = this.options.name
        this._camera = new TgdCameraOrthographic({
            near: 1e-3,
            far: 1e6,
            name: `Camera/${this.name}`,
        })
    }

    get camera(): TgdCamera {
        return this._camera
    }

    set camera(value: TgdCamera) {
        this._camera = value

        const { context } = this
        if (context) context.camera = value
    }

    refresh() {
        this.context?.paint()
    }

    toggleFullscreen(): Promise<boolean> {
        return tgdFullscreenToggle(this._canvas)
    }

    /**
     * @param target The canvas (with 2D context) into which
     * we will paste the final snapshot.
     * The width and height attributes must be set, because they
     * will be used to generate the snapshot.
     */
    takeSnapshot(target: HTMLCanvasElement) {
        const { context } = this
        if (context) context.takeSnapshot(target)
    }

    /**
     * @returns The real space dimension of a screen pixel.
     * This can be used to draw a scalebar.
     */
    get pixelScale() {
        const { context } = this
        if (!context) return 1

        const { camera } = context
        return (camera.zoom * camera.spaceHeightAtTarget) / camera.screenHeight
    }

    computeScalebar(options: Partial<ScalebarOptions> = {}) {
        return computeScalebarAttributes(this.pixelScale, options)
    }

    get canvas() {
        return this._canvas
    }
    set canvas(canvas: HTMLCanvasElement | null) {
        if (canvas === this._canvas) return

        if (this.orbiter) {
            this.orbiter.enabled = false
            this.orbiter.detach()
        }

        if (this.context) {
            this.context.camera.eventTransformChange.removeListener(
                this.handlePixelScaleDispatch
            )
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
                onResize: () => {
                    this.eventPixelScaleChange.dispatch(this.pixelScale)
                },
            })
            const camera = this._camera
            this.context.camera = camera
            this.context.camera.eventTransformChange.addListener(
                this.handlePixelScaleDispatch
            )
            const { cameraController } = this.options
            if (cameraController) {
                const orbiter = new TgdControllerCameraOrbit(
                    this.context,
                    cameraController
                )
                this.orbiter = orbiter
            }
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
        if (tgdFullscreenTest(this._canvas)) return true
        this.eventMouseWheelWithoutCtrl.dispatch()
        return false
    }

    private readonly handlePixelScaleDispatch = () => {
        const { context } = this
        if (!context) return

        const { camera } = context
        const spaceHeight = camera.spaceHeightAtTarget
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
