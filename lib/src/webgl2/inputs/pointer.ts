export interface Wgl2Pointer {
    x: number
    y: number
    t: number
}

export class Wgl2Gestures {
    public start: Wgl2Pointer = { x: 0, y: 0, t: 0 }
    public current: Wgl2Pointer = { x: 0, y: 0, t: 0 }
    public previous: Wgl2Pointer = { x: 0, y: 0, t: 0 }

    private canvas: HTMLCanvasElement | null = null
    private active = false
    private canvasX = 0
    private canvasY = 0
    private screenX = 0
    private screenY = 0
    private readonly inertiaDuration: number
    private inertiaDirX = 0
    private inertiaDirY = 0
    private inertiaStop = true
    private inertiaRunning = false
    private inertiaTimeStamp = 0
    private inertiaLastRefresh = 0

    constructor(
        private readonly options: Partial<{
            canvas: HTMLCanvasElement | null
            onMoveStart: (args: Wgl2Pointer) => void
            onMove: (args: {
                current: Wgl2Pointer
                previous: Wgl2Pointer
                start: Wgl2Pointer
            }) => void
            onMoveEnd: (args: Wgl2Pointer) => void
            onZoom: (direction: number, preventDefault: () => void) => void
            /**
             * Inertia is the time during which we pretend the pointer
             * is still moving, but at decreasing speed.
             */
            inertia: number
        }>
    ) {
        this.inertiaDuration = options.inertia ?? 0
        if (options.canvas) this.attach(options.canvas)
    }

    get element() {
        return this.canvas
    }

    attach(canvas: HTMLCanvasElement) {
        this.detach()
        this.canvas = canvas
        canvas.addEventListener(
            "pointerdown",
            this.handleCanvasPointerDown,
            true
        )
        canvas.addEventListener("wheel", this.handleCanvasWheel)
        document.addEventListener("pointerdown", this.handlePointerDown)
        document.addEventListener("pointermove", this.handlePointerMove)
        document.addEventListener("pointerup", this.handlePointerUp)
    }

    detach() {
        const { canvas } = this
        if (!canvas) return

        canvas.removeEventListener("pointerdown", this.handleCanvasPointerDown)
        canvas.removeEventListener("wheel", this.handleCanvasWheel)
        document.removeEventListener("pointerdown", this.handlePointerDown)
        document.removeEventListener("pointermove", this.handlePointerMove)
        document.removeEventListener("pointerup", this.handlePointerUp)
        this.canvas = null
    }

    private readonly handleCanvasWheel = (evt: WheelEvent) => {
        const { onZoom } = this.options
        if (!onZoom) return

        onZoom(evt.deltaY, () => evt.preventDefault())
    }

    private readonly handleCanvasPointerDown = (evt: PointerEvent) => {
        if (!evt.isPrimary) return

        evt.preventDefault()
        this.canvasX = evt.clientX
        this.canvasY = evt.clientY
        this.active = true
        this.inertiaStop = true
    }

    private readonly handlePointerDown = (evt: PointerEvent) => {
        if (!evt.isPrimary || !this.active) return

        evt.preventDefault()
        this.screenX = evt.clientX
        this.screenY = evt.clientY
        const point = this.getPoint(evt)
        this.start = this.current = point
        this.options.onMoveStart?.(point)
    }

    private readonly handlePointerMove = (evt: PointerEvent) => {
        if (!evt.isPrimary || !this.active || !this.canvas) return

        evt.preventDefault()
        this.previous = this.current
        this.current = this.getPoint(evt)
        this.options.onMove?.(this)
    }

    private readonly handlePointerUp = (evt: PointerEvent) => {
        if (!evt.isPrimary || !this.active) return

        evt.preventDefault()
        this.current = this.getPoint(evt)
        this.options.onMoveEnd?.(this.current)
        this.active = false
        this.inertiaStop = false
        this.inertiaRunning = false
        const dt = this.current.t - this.previous.t
        const w = dt > 0 ? 1 / dt : 0
        this.inertiaDirX = w * (this.current.x - this.previous.x)
        this.inertiaDirY = w * (this.current.y - this.previous.y)
        window.requestAnimationFrame(this.simulateInertia)
    }

    private getPoint(evt: PointerEvent): Wgl2Pointer {
        if (!this.canvas) throw Error("No canvas has been defined!")

        const { left, top, width, height } = this.canvas.getBoundingClientRect()
        const x =
            2 *
            ((this.canvasX + evt.clientX - this.screenX - left) / width - 0.5)
        const y =
            -2 *
            ((this.canvasY + evt.clientY - this.screenY - top) / height - 0.5)
        return { x, y, t: evt.timeStamp }
    }

    private readonly simulateInertia = (time: number) => {
        const { onMove } = this.options
        if (!onMove || this.inertiaDuration <= 0) return

        if (this.inertiaStop) return

        if (!this.inertiaRunning) {
            this.inertiaTimeStamp = time
            this.inertiaLastRefresh = time
            this.inertiaRunning = true
        }
        const t = time - this.inertiaTimeStamp

        const alpha = 1 - t / this.inertiaDuration
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
        onMove({
            current,
            previous,
            start,
        })
        window.requestAnimationFrame(this.simulateInertia)
    }
}
