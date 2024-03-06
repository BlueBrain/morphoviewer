import { TgdEvent } from "@tgd/event"
import {
    TgdInputPointer,
    TgdInputPointerEventMove,
    TgdInputPointerEventFinger,
    TgdInputPointerEventTap,
    TgdInputPointerEventZoom,
} from "@tgd/types"

const MOUSE_BUTTON_RIGHT = 2

export class TgdInputPointerImpl implements TgdInputPointer {
    readonly eventTap = new TgdEvent<Readonly<TgdInputPointerEventTap>>()
    readonly eventMoveStart = new TgdEvent<Readonly<TgdInputPointerEventMove>>()
    readonly eventMove = new TgdEvent<Readonly<TgdInputPointerEventMove>>()
    readonly eventMoveEnd = new TgdEvent<Readonly<TgdInputPointerEventMove>>()
    readonly eventZoom = new TgdEvent<Readonly<TgdInputPointerEventZoom>>()
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

    constructor(private readonly canvas: HTMLCanvasElement) {
        canvas.addEventListener("pointerdown", this.handlePointerDown, true)
        canvas.addEventListener("wheel", this.handleCanvasWheel)
        canvas.addEventListener("contextmenu", this.handleContextMenu)
        canvas.addEventListener("pointermove", this.handlePointerMove)
        canvas.addEventListener("pointerup", this.handlePointerUp)
    }

    detach() {
        const { canvas } = this
        if (!canvas) return

        canvas.removeEventListener("pointerdown", this.handlePointerDown)
        canvas.removeEventListener("wheel", this.handleCanvasWheel)
        canvas.removeEventListener("contextmenu", this.handleContextMenu)
        canvas.removeEventListener("pointermove", this.handlePointerMove)
        canvas.removeEventListener("pointerup", this.handlePointerUp)
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
            ...this.controlKeys,
        })
    }

    private readonly handlePointerDown = (evt: PointerEvent) => {
        if (!evt.isPrimary) return

        this.canvas.setPointerCapture(evt.pointerId)
        evt.preventDefault()
        evt.stopPropagation()
        this.pointerEvent = evt
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
    }

    private getPoint(
        evt: PointerEvent | WheelEvent
    ): TgdInputPointerEventFinger {
        this.controlKeys = {
            altKey: evt.altKey || evt.buttons === MOUSE_BUTTON_RIGHT,
            ctrlKey: evt.ctrlKey,
            metaKey: evt.metaKey,
            shiftKey: evt.shiftKey,
        }
        const { left, top, width, height } = this.canvas.getBoundingClientRect()
        const x = 2 * ((evt.clientX - left) / width - 0.5)
        const y = -2 * ((evt.clientY - top) / height - 0.5)
        return { x, y, t: evt.timeStamp, fingersCount: 1 }
    }
}
