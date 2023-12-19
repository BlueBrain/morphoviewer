import { Wgl2Camera } from "@/webgl2/camera/camera"
import { Wgl2Gestures, Wgl2Pointer } from "@/webgl2/gestures"

/**
 * The orbiter assumes a space where the poles are aligned with Y axis.
 *
 * Let's imagine a `target` at (0,0,0) and a `distance` of 1, then:
 *
 * - `latitude == 90°` => `position == (0, 1, 0)`
 * - 'latitude == 0` and `longitude == 0` => `position == (0, 0, 1)`
 */
export class Wgl2ControllerCameraOrbit {
    private readonly gestures: Wgl2Gestures

    constructor(
        private readonly camera: Wgl2Camera,
        private readonly options: Partial<{
            onChange: () => void
        }> = {}
    ) {
        this.gestures = new Wgl2Gestures({
            onMoveStart: this.handleStart,
            onMove: this.handleMove,
            onZoom: this.handleZoom,
        })
    }

    attach(canvas: HTMLCanvasElement) {
        this.gestures.attach(canvas)
        const { onChange } = this.options
        if (onChange) {
            this.camera.addEventListener("change", onChange)
        }
    }

    detach() {
        this.gestures.detach()
        const { onChange } = this.options
        if (onChange) {
            this.camera.removeEventListener("change", onChange)
        }
    }

    private readonly handleZoom = (direction: number) => {
        const factor = direction > 0 ? 1.1 : 0.9
        const zoom = this.camera.zoom.get()
        this.camera.zoom.set(zoom * factor)
    }

    private readonly handleStart = () => {}

    private readonly handleMove = ({
        previous,
        current,
    }: {
        previous: Wgl2Pointer
        current: Wgl2Pointer
    }) => {
        const factor = 5
        const x = current.x - previous.x
        const y = current.y - previous.y
        // const t = current.t - previous.t
        // const speedX = Math.abs(x) / t
        // const speedY = Math.abs(y) / t
        const angleX = y * factor // * speedX
        const angleY = -x * factor // * speedY
        this.camera.rotateAroundXY(angleX, angleY)
    }
}
