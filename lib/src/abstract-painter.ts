import { ScalebarOptions, computeScalebarAttributes } from "./scalebar"
import { Wgl2CameraOrthographic } from "./webgl2/camera"
import { Wgl2ControllerCameraOrbit } from "./webgl2/controller/camera/orbit"
import { Wgl2Event } from "./webgl2/event"
import { Wgl2Gestures } from "./webgl2/gestures"
import { isFullScreen, toggleFullscreen } from "./webgl2/fullscreen"
import { Wgl2Resources } from "./webgl2/resources/resources"

export interface PainterOptions extends WebGLContextAttributes {
    /**
     * If set to `false`, no gesture will change the camera position.
     * And you will need to manage this outside of the library by accessing
     * `AbstractPainter.camera` property.
     *
     * Default to `true`.
     */
    cameraControllerEnabled: boolean
}

export abstract class AbstractPainter {
    public readonly eventPixelScaleChange = new Wgl2Event<number>()
    public readonly eventMouseWheelWithoutCtrl = new Wgl2Event<void>()

    /**
     * `pixelScale` depends on the camera height, the zoom and
     * the viewport height.
     * We memorize these values to send the `eventPixelScaleChange` when
     * needed.
     */
    private previousCameraHeight = -1
    private previousCameraZoom = -1
    private previousViewportHeight = -1

    protected resources: Wgl2Resources | null = null
    protected readonly _camera = new Wgl2CameraOrthographic()
    protected readonly orbiter: Wgl2ControllerCameraOrbit
    protected readonly options: PainterOptions
    private _canvas: HTMLCanvasElement | null = null
    private currentAnimationFrameId = 0
    private readonly observer: ResizeObserver

    constructor(options: Partial<PainterOptions>) {
        this.options = {
            cameraControllerEnabled: true,
            ...options,
        }
        this._camera = new Wgl2CameraOrthographic()
        this.orbiter = new Wgl2ControllerCameraOrbit(this._camera, {
            onChange: this.refresh,
            onWheel: this.handleMouseWheel,
        })
        this.orbiter.enabled = this.options.cameraControllerEnabled
        this.observer = new ResizeObserver(this.handleResize)
    }

    public readonly refresh = () => {
        window.cancelAnimationFrame(this.currentAnimationFrameId)
        this.currentAnimationFrameId = window.requestAnimationFrame(
            this.prepaint
        )
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
        const { resources, canvas } = this
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
        this.paint(resources, Date.now())
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
        return (
            (camera.height.get() * camera.zoom.get()) / camera.viewport.height
        )
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

        const { resources } = this
        if (resources) {
            resources.cleanUp()
            this.resources = null
        }
        this._camera.eventChange.removeListener(this.refresh)
        this._camera.eventChange.removeListener(this.handlePixelScaleDispatch)
        this.orbiter.detach()
        if (this._canvas) this.observer.unobserve(this._canvas)
        this._canvas = canvas
        if (canvas) {
            this.observer.observe(canvas)
            this.orbiter.attach(canvas)
            this._camera.eventChange.addListener(this.refresh)
            this._camera.eventChange.addListener(this.handlePixelScaleDispatch)
            const gl = canvas.getContext("webgl2", {
                antialias: true,
                alpha: false,
                ...this.options,
                depth: true,
                preserveDrawingBuffer: true,
                premultipliedAlpha: true,
            })
            if (!gl) throw Error("Unable to create a WebGL2 context!")

            this.resources = new Wgl2Resources(gl)
            this.init()
        }
        this.resize()
    }

    protected abstract init(): void

    protected abstract readonly paint: (
        resources: Wgl2Resources,
        time: number
    ) => void

    private readonly prepaint = (time: number) => {
        const { resources } = this
        if (!resources) return

        this.paint(resources, time)
    }

    private readonly handleResize: ResizeObserverCallback = () => {
        this.resize()
    }

    private resize() {
        const { resources } = this
        if (!resources) return

        const { gl } = resources
        const canvas = gl.canvas as HTMLCanvasElement
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
        this.refresh()
    }

    private readonly handleMouseWheel = (gestures: Wgl2Gestures) => {
        if (gestures.isKeyDown("Control")) return true
        if (isFullScreen(this._canvas)) return true
        this.eventMouseWheelWithoutCtrl.dispatch()
        return false
    }

    private readonly handlePixelScaleDispatch = () => {
        const camera = this._camera
        const cameraHeight = camera.height.get()
        const cameraZoom = camera.zoom.get()
        const viewportHeight = camera.viewport.height
        if (
            cameraHeight === this.previousCameraHeight &&
            cameraZoom === this.previousCameraZoom &&
            viewportHeight === this.previousViewportHeight
        ) {
            return
        }

        this.previousCameraHeight = cameraHeight
        this.previousCameraZoom = cameraZoom
        this.previousViewportHeight = viewportHeight
        this.eventPixelScaleChange.dispatch(this.pixelScale)
    }
}
