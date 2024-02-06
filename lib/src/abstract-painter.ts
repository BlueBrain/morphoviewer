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
     * @returns An image, loaded with the current rendering.
     */
    async takeSnapshot(): Promise<HTMLCanvasElement> {
        const { resources, canvas } = this
        if (!resources || !canvas) return document.createElement("canvas")

        const w = canvas.width
        const h = canvas.height

        const { gl } = resources
        gl.flush()

        const pixels = new Uint8Array(w * h * 4)
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
        const bmp = await createBitmap(w, h, pixels)
        document.body.appendChild(bmp)
        bmp.style.position = "absolute"
        bmp.style.zIndex = "999999"
        const ctx = getContext2dFromPixels(w, h, pixels)
        return new Promise(resolve => {
            resolve(ctx.canvas)
        })
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

function getContext2dFromPixels(
    width: number,
    height: number,
    pixels: Uint8Array
): CanvasRenderingContext2D {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) throw Error("Unable to create a 2D context!")

    const w = canvas.width
    const h = canvas.height
    const bmp = ctx.getImageData(0, 0, w, h)
    let ptr = w * h * 4
    let src = 0
    const stride = w * 4
    for (let row = 0; row < h; row++) {
        ptr -= stride
        let dst = ptr
        for (let col = 0; col < w; col++) {
            const R = pixels[src + 0]
            const G = pixels[src + 1]
            const B = pixels[src + 2]
            const A = pixels[src + 3]
            src += 4
            const norm = 1 // 255 / A
            bmp.data[dst + 0] = R * norm
            bmp.data[dst + 1] = G * norm
            bmp.data[dst + 2] = B * norm
            bmp.data[dst + 3] = A
            dst += 4
        }
    }
    console.log("🚀 [abstract-painter] bmp.data = ", bmp.data) // @FIXME: Remove this line written on 2024-01-22 at 17:07
    ctx.putImageData(bmp, 0, 0)
    return ctx
}

function createBitmap(
    width: number,
    height: number,
    pixels: Uint8Array
): Promise<HTMLImageElement> {
    const headerSize = 70
    const imageSize = width * height * 4

    const arr = new Uint8Array(headerSize + imageSize)
    const view = new DataView(arr.buffer)

    // File Header

    // BM magic number.
    view.setUint16(0, 0x424d, false)
    // File size.
    view.setUint32(2, arr.length, true)
    // Offset to image data.
    view.setUint32(10, headerSize, true)

    // BITMAPINFOHEADER

    // Size of BITMAPINFOHEADER
    view.setUint32(14, 40, true)
    // Width
    view.setInt32(18, width, true)
    // Height (signed because negative values flip
    // the image vertically).
    view.setInt32(22, height, true)
    // Number of colour planes (colours stored as
    // separate images; must be 1).
    view.setUint16(26, 1, true)
    // Bits per pixel.
    view.setUint16(28, 32, true)
    // Compression method, 6 = BI_ALPHABITFIELDS
    view.setUint32(30, 6, true)
    // Image size in bytes.
    view.setUint32(34, imageSize, true)
    // Horizontal resolution, pixels per metre.
    // This will be unused in this situation.
    view.setInt32(38, 10000, true)
    // Vertical resolution, pixels per metre.
    view.setInt32(42, 10000, true)
    // Number of colours. 0 = all
    view.setUint32(46, 0, true)
    // Number of important colours. 0 = all
    view.setUint32(50, 0, true)

    // Colour table. Because we used BI_ALPHABITFIELDS
    // this specifies the R, G, B and A bitmasks.

    // Red
    view.setUint32(54, 0x000000ff, true)
    // Green
    view.setUint32(58, 0x0000ff00, true)
    // Blue
    view.setUint32(62, 0x00ff0000, true)
    // Alpha
    view.setUint32(66, 0xff000000, true)

    for (let src = 0; src < pixels.length; src++) {
        const dst = headerSize + src
        view.setUint8(dst, pixels[src])
    }

    return new Promise(resolve => {
        const img = new Image()
        const blob = new Blob([arr], { type: "image/bmp" })
        const url = window.URL.createObjectURL(blob)
        console.log("🚀 [abstract-painter] url = ", url) // @FIXME: Remove this line written on 2024-01-22 at 18:46
        img.onload = () => {
            resolve(img)
            window.setTimeout(() => {
                window.URL.revokeObjectURL(url)
            }, 10000)
        }
        img.onerror = (...args: unknown[]) => {
            console.error("Unable to create a BMP image!", args)
        }
        img.src = url
    })
}
