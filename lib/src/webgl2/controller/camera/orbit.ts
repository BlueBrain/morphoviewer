import { Wgl2Camera } from "@/webgl2/camera/camera"
import { isFullScreen } from "@/webgl2/fullscreen"
import { Wgl2Gestures, Wgl2Pointer } from "@/webgl2/inputs/pointer"
import { Wgl2InputKeyboard } from "@/webgl2/inputs/keyboard"

/**
 * The orbiter assumes a space where the poles are aligned with Y axis.
 *
 * Let's imagine a `target` at (0,0,0) and a `distance` of 1, then:
 *
 * - `latitude == 90°` => `position == (0, 1, 0)`
 * - 'latitude == 0` and `longitude == 0` => `position == (0, 0, 1)`
 */
export class Wgl2ControllerCameraOrbit {
    private readonly keyboard: Wgl2InputKeyboard
    private readonly gestures: Wgl2Gestures
    /**
     * If `enabled === false`, the camera will not be moved
     * by any gesture.
     */
    public enabled = true

    constructor(
        private readonly camera: Wgl2Camera,
        private readonly options: Partial<{
            onChange: () => void
            /**
             * @returns `true` if we accept this Wheel gesture.
             */
            onWheel: (gestures: Wgl2Gestures) => boolean
        }> = {}
    ) {
        this.gestures = new Wgl2Gestures({
            onMoveStart: this.handleStart,
            onMove: this.handleMove,
            onZoom: this.handleZoom,
            inertia: 500,
        })
        this.keyboard = new Wgl2InputKeyboard()
    }

    attach(canvas: HTMLCanvasElement) {
        this.gestures.attach(canvas)
        const { onChange } = this.options
        if (onChange) {
            this.camera.eventChange.addListener(onChange)
        }
    }

    detach() {
        this.gestures.detach()
        const { onChange } = this.options
        if (onChange) {
            this.camera.eventChange.removeListener(onChange)
        }
    }

    private readonly handleZoom = (
        direction: number,
        preventDefault: () => void
    ) => {
        const { gestures, keyboard, enabled } = this
        if (!enabled) return

        const { onWheel } = this.options
        if (!isFullScreen(gestures.element) && !keyboard.isPressed("Control")) {
            const accept = onWheel?.(gestures) ?? true
            if (!accept) return
        }
        const factor = direction > 0 ? 1.1 : 0.9
        const zoom = this.camera.zoom.get()
        this.camera.zoom.set(zoom * factor)
        preventDefault()
    }

    private readonly handleStart = () => {}

    private readonly handleMove = ({
        previous,
        current,
    }: {
        previous: Wgl2Pointer
        current: Wgl2Pointer
    }) => {
        if (!this.enabled) return

        const factor = 5
        const x = current.x - previous.x
        const y = current.y - previous.y
        const angleX = y * factor
        const angleY = -x * factor
        this.camera.rotateAroundXY(angleX, angleY)
    }
}
