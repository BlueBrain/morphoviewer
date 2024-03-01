import {
    TgdCamera,
    TgdCameraPerspective,
    TgdContext,
    TgdEvent,
    TgdInputPointerEventTap,
    TgdPainterClear,
    TgdPainterDepth,
    TgdPainterSegments,
    TgdPainterSegmentsData,
    TgdQuat,
    TgdQuatFace,
    TgdVec3,
} from "@tgd"
import { TipsPainter } from "./painter/tips"

export class GizmoCanvas {
    public eventOrientationChange = new TgdEvent<Readonly<TgdQuat>>()

    private _canvas: HTMLCanvasElement | null = null
    private painter: TipsPainter | null = null
    private context: TgdContext | null = null

    updateOrientationFrom(camera: TgdCamera) {
        const { painter } = this
        if (!painter) return

        painter.updateOrientationFrom(camera)
    }

    get canvas() {
        return this._canvas
    }
    set canvas(canvas: HTMLCanvasElement | null) {
        if (canvas === this._canvas) return

        this._canvas = canvas
        if (this.context) {
            this.context.inputs.pointer.eventTap.removeListener(this.handleTap)
            this.context.destroy()
            this.context = null
            this.painter = null
        }
        if (!canvas) return

        const context = new TgdContext(canvas, {
            alpha: true,
            depth: true,
            antialias: true,
        })
        const camera = new TgdCameraPerspective()
        camera.distance = 4
        camera.x = 0
        camera.y = 0
        camera.z = 0
        camera.fovy = Math.PI / 4
        camera.near = 1e-6
        camera.far = camera.distance * 2
        context.camera = camera
        context.inputs.pointer.eventTap.addListener(this.handleTap)
        this.context = context
        const painter = new TipsPainter(context)
        this.painter = painter
        context.add(
            new TgdPainterClear(context, {
                color: [0, 0, 0, 0],
                depth: 1,
            }),
            new TgdPainterDepth(context, { enabled: true }),
            makeAxis(context),
            painter
        )
        context.paint()
    }

    private readonly handleTap = (evt: TgdInputPointerEventTap) => {
        const { context } = this
        if (!context) return

        const { origin, direction } = context.camera.castRay(evt.x, evt.y)
        const maxDist = 1
        let bestDist = maxDist
        let bestTip = TIPS[0][0]
        let bestName: TgdQuatFace = "+X+Y+Z"
        for (const [tip, name] of TIPS) {
            const dist = tip.distanceToLineSquared(origin, direction)
            if (dist < bestDist) {
                bestDist = dist
                bestTip = tip
                bestName = name
            }
        }
        if (bestDist < maxDist) {
            console.log("Hit:", bestName, bestTip, bestDist)
            const quat = new TgdQuat()
            quat.face(bestName)
            if (quat.isEqual(context.camera.orientation)) {
                quat.rotateAroundY(Math.PI)
            }
            context.camera.orientation = quat
            this.eventOrientationChange.dispatch(quat)
            context.paint()
        }
    }
}

const TIPS: Array<[TgdVec3, TgdQuatFace]> = [
    [new TgdVec3(1, 0, 0), "-Z+Y+X"],
    [new TgdVec3(0, 1, 0), "+Z+X+Y"],
    [new TgdVec3(0, 0, 1), "+X+Y+Z"],
    [new TgdVec3(-1, 0, 0), "+Z+Y-X"],
    [new TgdVec3(0, -1, 0), "+Z-X-Y"],
    [new TgdVec3(0, 0, -1), "-X+Y-Z"],
]

function makeAxis(context: TgdContext) {
    const data = new TgdPainterSegmentsData()
    const A = 0.05
    const B = 0
    const E = 1e-1
    data.add([E, 0, 0, A], [1, 0, 0, B], [0, 0], [0, 0])
    data.add([0, E, 0, A], [0, 1, 0, B], [0.5, 0], [0.5, 0])
    data.add([0, 0, E, A], [0, 0, 1, B], [1, 0], [1, 0])
    const segments = new TgdPainterSegments(context, data)
    segments.colorTexture.makePalette(["#a00", "#0a0", "#00a"])
    return segments
}
