import { TgdEvent } from "@tgd/event"
import {
    TgdContextInterface,
    TgdInputPointerEventMove,
    TgdInputPointerEventFinger,
} from "@tgd/types"

export interface TgdControllerCameraOrbitOptions {
    speedOrbit: number
    speedZoom: number
}

export class TgdControllerCameraOrbit {
    /**
     * The camera will only move if `enabled === true`.
     */
    public enabled = true
    public speedZoom = 1
    public speedOrbit = 1
    public readonly eventZoomChange = new TgdEvent<TgdControllerCameraOrbit>()
    public readonly eventOrbitChange = new TgdEvent<TgdControllerCameraOrbit>()

    constructor(
        private readonly context: TgdContextInterface,
        {
            speedZoom = 1,
            speedOrbit = 1,
        }: Partial<TgdControllerCameraOrbitOptions> = {}
    ) {
        const { inputs } = context
        inputs.pointer.eventMove.addListener(this.handleMove)
        inputs.pointer.eventZoom.addListener(this.handleZoom)
        this.speedOrbit = speedOrbit
        this.speedZoom = speedZoom
    }

    detach() {
        const { inputs } = this.context
        inputs.pointer.eventMove.removeListener(this.handleMove)
        inputs.pointer.eventZoom.removeListener(this.handleZoom)
    }

    private readonly handleMove = (evt: TgdInputPointerEventMove) => {
        if (!this.enabled) return

        const dt = evt.current.t - evt.previous.t
        if (dt <= 0) return

        const { context } = this
        const { keyboard } = context.inputs
        if (evt.ctrlKey || evt.current.fingersCount === 2)
            return this.handlePan(evt)

        if (keyboard.isDown("z")) return this.handleRotateAroundZ(evt)

        const { camera } = context
        const speed = 3 * (evt.shiftKey ? 0.1 : 1) * this.speedOrbit
        const dx = (evt.current.x - evt.previous.x) * speed
        const dy = (evt.current.y - evt.previous.y) * speed
        if (!keyboard.isDown("x")) camera.orbitAroundY(-dx)
        if (!keyboard.isDown("y")) camera.orbitAroundX(dy)
        this.fireOrbitChange()
    }

    private handlePan(evt: TgdInputPointerEventMove) {
        const { camera } = this.context
        const panSpeed = 0.5
        const dx =
            (evt.current.x - evt.previous.x) *
            panSpeed *
            camera.spaceWidthAtTarget
        const dy =
            (evt.current.y - evt.previous.y) *
            panSpeed *
            camera.spaceHeightAtTarget
        camera.moveTarget(-dx, -dy, 0)
        this.fireOrbitChange()
        return
    }

    private handleRotateAroundZ(evt: TgdInputPointerEventMove) {
        const { camera } = this.context
        const x1 = evt.previous.x
        const y1 = evt.previous.y
        if (Math.abs(x1) + Math.abs(y1) === 0) return

        const x2 = evt.current.x
        const y2 = evt.current.y
        if (Math.abs(x2) + Math.abs(y2) === 0) return

        const x = x1 * x2 + y1 * y2
        const y = x1 * y2 - y1 * x2
        const ang = Math.atan2(y, x) * this.speedOrbit
        camera.orbitAroundZ(-ang)
        this.fireOrbitChange()
        return
    }

    private fireOrbitChange() {
        this.eventOrbitChange.dispatch(this)
        this.context.paint()
    }

    private readonly handleZoom = (evt: {
        current: TgdInputPointerEventFinger
        direction: number
        preventDefault: () => void
    }) => {
        if (!this.enabled) return

        const { camera } = this.context
        let speed = 5e-2 * this.speedZoom
        if (this.context.inputs.keyboard.isDown("Shift")) speed *= 0.1
        const dz = -evt.direction * speed
        camera.zoom = Math.max(1e-5, camera.zoom + dz)
        evt.preventDefault()
        this.fireZoomChange()
    }

    private fireZoomChange() {
        this.eventZoomChange.dispatch(this)
        this.context.paint()
    }
}
