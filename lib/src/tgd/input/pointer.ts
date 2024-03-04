import { TgdEvent } from "@tgd/event"
import {
    TgdInputPointer,
    TgdInputPointerEventMove,
    TgdInputPointerEventFinger,
    TgdInputPointerEventTap,
} from "@tgd/types"

const MOUSE_BUTTON_RIGHT = 2

export class TgdInputPointerImpl implements TgdInputPointer {
    readonly eventTap = new TgdEvent<Readonly<TgdInputPointerEventTap>>()
    readonly eventMoveStart = new TgdEvent<Readonly<TgdInputPointerEventMove>>()
    readonly eventMove = new TgdEvent<Readonly<TgdInputPointerEventMove>>()
    readonly eventMoveEnd = new TgdEvent<Readonly<TgdInputPointerEventMove>>()
    readonly eventZoom = new TgdEvent<
        Readonly<{
            current: TgdInputPointerEventFinger
            direction: number
            preventDefault: () => void
        }>
    >()
    public inertia = 0
    /**
     * This is a tap only of the pointer touched for less that
     * `tapDelay` milliseconds.
     */
    public tapDelay = 300

    private controlKeys = {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
    }
    private start: TgdInputPointerEventFinger = {
        x: 0,
        y: 0,
        t: 0,
        fingersCount: 1,
    }
    private current: TgdInputPointerEventFinger = {
        x: 0,
        y: 0,
        t: 0,
        fingersCount: 1,
    }
    private previous: TgdInputPointerEventFinger = {
        x: 0,
        y: 0,
        t: 0,
        fingersCount: 1,
    }
    /**
     * If not null, the pointer is touching.
     */
    private pointerEvent: PointerEvent | null = null
    private canvasX = 0
    private canvasY = 0
    private screenX = 0
    private screenY = 0
    private inertiaDirX = 0
    private inertiaDirY = 0
    private inertiaStop = true
    private inertiaRunning = false
    private inertiaTimeStamp = 0
    private inertiaLastRefresh = 0

    constructor(private readonly canvas: HTMLCanvasElement) {
        canvas.addEventListener(
            "pointerdown",
            this.handleCanvasPointerDown,
            true
        )
        canvas.addEventListener("wheel", this.handleCanvasWheel)
        canvas.addEventListener("contextmenu", this.handleContextMenu)
        document.addEventListener("pointerdown", this.handlePointerDown)
        document.addEventListener("pointermove", this.handlePointerMove)
        document.addEventListener("pointerup", this.handlePointerUp)
    }

    detach() {
        const { canvas } = this
        if (!canvas) return

        canvas.removeEventListener("pointerdown", this.handleCanvasPointerDown)
        canvas.removeEventListener("wheel", this.handleCanvasWheel)
        canvas.removeEventListener("contextmenu", this.handleContextMenu)
        document.removeEventListener("pointerdown", this.handlePointerDown)
        document.removeEventListener("pointermove", this.handlePointerMove)
        document.removeEventListener("pointerup", this.handlePointerUp)
    }

    private readonly handleContextMenu = (evt: {
        preventDefault: () => void
    }) => {
        evt.preventDefault()
    }

    private readonly handleCanvasWheel = (evt: WheelEvent) => {
        let delta = evt.deltaX + evt.deltaY + evt.deltaZ
        if (delta > 0) delta = 1
        else delta = -1
        this.eventZoom.dispatch({
            current: this.getPoint(evt),
            direction: delta,
            preventDefault: () => evt.preventDefault(),
        })
    }

    private readonly handleCanvasPointerDown = (evt: PointerEvent) => {
        if (!evt.isPrimary) return

        evt.preventDefault()
        this.canvasX = evt.clientX
        this.canvasY = evt.clientY
        this.pointerEvent = evt
        this.inertiaStop = true
    }

    private readonly handlePointerDown = (evt: PointerEvent) => {
        if (!evt.isPrimary || !this.pointerEvent) return

        evt.preventDefault()
        this.screenX = evt.clientX
        this.screenY = evt.clientY
        const point = this.getPoint(evt)
        this.start = this.current = this.previous = point
        this.eventMoveStart.dispatch({
            start: point,
            current: point,
            previous: point,
            ...this.controlKeys,
        })
    }

    private readonly handlePointerMove = (evt: PointerEvent) => {
        if (!evt.isPrimary || !this.pointerEvent || !this.canvas) return

        this.previous = this.current
        this.current = this.getPoint(evt)
        this.eventMove.dispatch({
            start: this.start,
            current: this.current,
            previous: this.previous,
            ...this.controlKeys,
        })
    }

    private readonly handlePointerUp = (evt: PointerEvent) => {
        if (!evt.isPrimary || !this.pointerEvent) return

        evt.preventDefault()
        this.current = this.getPoint(evt)
        this.eventMoveEnd.dispatch({
            start: this.start,
            current: this.current,
            previous: this.previous,
            ...this.controlKeys,
        })
        this.pointerEvent = null
        // Tap event.
        if (evt.timeStamp - this.start.t < this.tapDelay) {
            this.eventTap.dispatch({
                ...this.start,
                ...this.controlKeys,
            })
        }
        // Inertia.
        this.inertiaStop = false
        this.inertiaRunning = false
        const dt = this.current.t - this.previous.t
        const w = dt > 0 ? 1 / dt : 0
        this.inertiaDirX = w * (this.current.x - this.previous.x)
        this.inertiaDirY = w * (this.current.y - this.previous.y)
        window.requestAnimationFrame(this.simulateInertia)
    }

    private getPoint(
        evt: PointerEvent | WheelEvent
    ): TgdInputPointerEventFinger {
        this.controlKeys = {
            altKey: evt.altKey,
            ctrlKey: evt.ctrlKey || evt.buttons === MOUSE_BUTTON_RIGHT,
            metaKey: evt.metaKey,
            shiftKey: evt.shiftKey,
        }
        const { left, top, width, height } = this.canvas.getBoundingClientRect()
        const x =
            2 *
            ((this.canvasX + evt.clientX - this.screenX - left) / width - 0.5)
        const y =
            -2 *
            ((this.canvasY + evt.clientY - this.screenY - top) / height - 0.5)
        return { x, y, t: evt.timeStamp, fingersCount: 1 }
    }

    private readonly simulateInertia = (time: number) => {
        if (this.inertia <= 0 || this.inertiaStop) return

        if (!this.inertiaRunning) {
            this.inertiaTimeStamp = time
            this.inertiaLastRefresh = time
            this.inertiaRunning = true
        }
        const t = time - this.inertiaTimeStamp

        const alpha = 1 - t / this.inertia
        if (alpha <= 0 || alpha > 1) return

        const dt = t - this.inertiaLastRefresh
        this.inertiaLastRefresh = t
        const vx = this.inertiaDirX * dt * alpha
        const vy = this.inertiaDirY * dt * alpha
        this.previous = { ...this.current }
        this.current.t = this.previous.t + dt
        this.current.x += vx
        this.current.y += vy
        const { current, previous, start } = this
        this.eventMove.dispatch({
            current,
            previous,
            start,
            ...this.controlKeys,
        })
        window.requestAnimationFrame(this.simulateInertia)
    }
}
