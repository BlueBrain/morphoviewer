import { TgdAnimation } from "@tgd/types/animation"
import { tgdEasingFunctionOutQuad } from "@tgd/utils"
import { clamp } from "@tgd/utils/math"
import {
    TgdContextInterface,
    TgdInputPointerEventMove,
    TgdInputPointerModifierKeys,
    TgdInputPointerEventZoom,
} from "@tgd/types"
import { TgdEvent } from "@tgd/event"
import { TgdCamera } from "@tgd/camera"

export interface TgdControllerCameraOrbitZoomRequest
    extends TgdInputPointerModifierKeys {
    x: number
    y: number
}

export interface TgdControllerCameraOrbitOptions {
    minZoom: number
    maxZoom: number
    speedOrbit: number
    speedZoom: number
    speedPanning: number
    /**
     * Time in msec during which the orbiting continues
     * after the pointer stop touching.
     */
    inertiaOrbit: number
    /**
     * Time in msec during which the zooming continues
     * after the pointer stop touching.
     *
     * Default to 0.
     */
    inertiaZoom: number
    /**
     * Time in msec during which the panning continues
     * after the pointer stop touching.
     *
     * Default to 0.
     */
    inertiaPanning: number
    /**
     * If `true`, pannig will only act on `camera.shift`,
     * not on `camera.target`.
     *
     * Default to 0.
     */
    fixedTarget: boolean
    /**
     * Zooming can be done by the mouse wheel.
     * In this case, we may want to prevent it when the
     * canvas is not in fullscreen, to let the rest of
     * the page to scroll.
     *
     * This function, if defined, will be called just
     * before the zoom event. If it returns `false`,
     * the event is not dispatched.
     */
    onZoomRequest(this: void, evt: TgdControllerCameraOrbitZoomRequest): boolean
}

export class TgdControllerCameraOrbit {
    public readonly eventChange = new TgdEvent<TgdCamera>()
    public minZoom = 1e-3
    public maxZoom = Infinity
    /**
     * The camera will only move if `enabled === true`.
     */
    public enabled = true
    public speedZoom = 1
    public speedOrbit = 1
    public speedPanning = 1
    public inertiaZoom = 0
    public inertiaOrbit = 0
    public inertiaPanning = 0
    /**
     * If `true`, pannig will only act on `camera.shift`,
     * not on `camera.target`.
     */
    public fixedTarget = false
    /**
     * Zooming can be done by the mouse wheel.
     * In this case, we may want to prevent it when the
     * canvas is not in fullscreen, to let the rest of
     * the page to scroll.
     *
     * This function, if defined, will be called just
     * before the zoom event. If it returns `false`,
     * the event is not dispatched.
     */
    public onZoomRequest: (
        this: void,
        evt: TgdControllerCameraOrbitZoomRequest
    ) => boolean

    private animOrbit: TgdAnimation | null = null

    constructor(
        private readonly context: TgdContextInterface,
        {
            minZoom = 1e-3,
            maxZoom = Infinity,
            speedZoom = 1,
            speedOrbit = 1,
            speedPanning = 1,
            inertiaZoom = 0,
            inertiaOrbit = 0,
            inertiaPanning = 0,
            fixedTarget = false,
            onZoomRequest = alwaysTrue,
        }: Partial<TgdControllerCameraOrbitOptions> = {}
    ) {
        const { inputs } = context
        inputs.pointer.eventMoveStart.addListener(this.handleMoveStart)
        inputs.pointer.eventMoveEnd.addListener(this.handleMoveEnd)
        inputs.pointer.eventMove.addListener(this.handleMove)
        inputs.pointer.eventZoom.addListener(this.handleZoom)
        this.speedOrbit = speedOrbit
        this.speedZoom = speedZoom
        this.speedPanning = speedPanning
        this.inertiaOrbit = inertiaOrbit
        this.inertiaZoom = inertiaZoom
        this.inertiaPanning = inertiaPanning
        this.fixedTarget = fixedTarget
        this.minZoom = minZoom
        this.maxZoom = maxZoom
        this.onZoomRequest = onZoomRequest
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
        if (evt.altKey || evt.current.fingersCount === 2)
            return this.handlePan(evt)

        if (keyboard.isDown("z")) return this.handleRotateAroundZ(evt)

        this.orbit(
            evt.current.x - evt.previous.x,
            evt.current.y - evt.previous.y,
            evt.shiftKey
        )
    }

    private orbit(deltaX: number, deltaY: number, slowDown: boolean) {
        const { context } = this
        const { camera } = context
        const { keyboard } = context.inputs
        const speed = 3 * (slowDown ? 0.1 : 1) * this.speedOrbit
        const dx = deltaX * speed
        const dy = deltaY * speed
        if (!keyboard.isDown("x")) camera.orbitAroundY(-dx)
        if (!keyboard.isDown("y")) camera.orbitAroundX(dy)
        this.fireOrbitChange()
    }

    private readonly handleMoveStart = () => {
        if (!this.enabled) return

        const { animOrbit, context } = this
        if (animOrbit) context.animCancel(animOrbit)
    }

    private readonly handleMoveEnd = (evt: TgdInputPointerEventMove) => {
        if (!this.enabled) return

        const { context, inertiaOrbit } = this
        if (inertiaOrbit > 0) {
            const inverseDeltaTime =
                inertiaOrbit / (evt.current.t - evt.previous.t)
            const slowDown = evt.shiftKey
            const dx = inverseDeltaTime * (evt.current.x - evt.previous.x)
            const dy = inverseDeltaTime * (evt.current.y - evt.previous.y)
            let previousAlpha = 0
            this.animOrbit = {
                duration: inertiaOrbit,
                action: alpha => {
                    const t = alpha - previousAlpha
                    previousAlpha = alpha
                    this.orbit(dx * t, dy * t, slowDown)
                },
                easingFunction: tgdEasingFunctionOutQuad,
            }
            context.animSchedule(this.animOrbit)
        }
    }

    private handlePan(evt: TgdInputPointerEventMove) {
        const { fixedTarget, speedPanning, context } = this
        const { camera } = context
        const inverseZoom = 1 / camera.zoom
        const panSpeed = 0.5 * speedPanning * inverseZoom
        const dx =
            (evt.current.x - evt.previous.x) *
            panSpeed *
            camera.spaceWidthAtTarget
        const dy =
            (evt.current.y - evt.previous.y) *
            panSpeed *
            camera.spaceHeightAtTarget
        if (fixedTarget) {
            camera.moveShift(-dx, -dy, 0)
        } else {
            camera.moveTarget(-dx, -dy, 0)
        }
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
        this.context.paint()
        this.eventChange.dispatch(this.context.camera)
    }

    private readonly handleZoom = (evt: TgdInputPointerEventZoom) => {
        if (
            !this.enabled ||
            this.speedZoom === 0 ||
            !this.onZoomRequest({
                altKey: evt.altKey,
                ctrlKey: evt.ctrlKey,
                metaKey: evt.metaKey,
                shiftKey: evt.shiftKey,
                x: evt.current.x,
                y: evt.current.y,
            })
        )
            return

        const { context } = this
        const { camera } = context
        let speed = 0.1 * this.speedZoom
        if (this.context.inputs.keyboard.isDown("Shift")) speed *= 0.1
        const dz = -evt.direction * speed
        camera.zoom = clamp(camera.zoom * (1 + dz), this.minZoom, this.maxZoom)
        evt.preventDefault()
        this.fireZoomChange()
    }

    private fireZoomChange() {
        this.context.paint()
    }
}

/**
 * Default function for `onZoomRequest`.
 */
const alwaysTrue = () => true
