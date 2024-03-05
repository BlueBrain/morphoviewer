import {
    TgdCamera,
    TgdCameraPerspective,
    TgdContext,
    TgdControllerCameraOrbit,
    TgdEvent,
    TgdInputPointerEventTap,
    TgdPainterClear,
    TgdPainterDepth,
    TgdQuat,
    TgdQuatFace,
    TgdVec3,
} from "@tgd"
import { TipsPainter } from "./painter/tips"

export class GizmoCanvas {
    /**
     * The user clicked a tip, so we dispatch the target orientation.
     */
    public eventTipClick = new TgdEvent<{
        from: Readonly<TgdQuat>
        to: Readonly<TgdQuat>
    }>()

    private _canvas: HTMLCanvasElement | null = null
    private context: TgdContext | null = null
    private _camera: TgdCamera | null = null
    private _orbiter: TgdControllerCameraOrbit | null = null
    private _tipsPainter: TipsPainter | null = null

    attachCamera(camera: TgdCamera) {
        this._camera = camera
        const { context } = this
        if (!context) return

        context.camera = camera
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
            const orbiter = this._orbiter
            if (orbiter) {
                orbiter.detach()
            }
        }
        this._tipsPainter?.delete()
        if (!canvas) return

        const context = new TgdContext(canvas, {
            alpha: true,
            depth: true,
            antialias: true,
            name: "GizmoCanvas",
        })
        context.inputs.pointer.eventTap.addListener(this.handleTap)
        this.context = context
        if (this._camera) this.context.camera = this._camera
        this._orbiter = new TgdControllerCameraOrbit(context, {
            speedPanning: 0,
            speedZoom: 0,
        })
        const painter = new TipsPainter(context)
        this._tipsPainter = painter
        context.add(
            new TgdPainterClear(context, {
                color: [0, 0, 0, 0],
                depth: 1,
            }),
            new TgdPainterDepth(context, { enabled: true }),
            painter
        )
        context.paint()
    }

    private readonly handleTap = (evt: TgdInputPointerEventTap) => {
        const camera = this._tipsPainter?.camera
        if (!camera) return

        const { origin, direction } = camera.castRay(evt.x, evt.y)
        const maxDist = 1
        let bestDist = maxDist
        // let bestTip = TIPS[0][0]
        let bestName: TgdQuatFace = "+X+Y+Z"
        for (const [tip, name] of TIPS) {
            const dist = tip.distanceToLineSquared(origin, direction)
            if (dist < bestDist) {
                bestDist = dist
                // bestTip = tip
                bestName = name
            }
        }
        if (bestDist < maxDist) {
            const quat = new TgdQuat()
            quat.face(bestName)
            if (quat.isEqual(camera.orientation)) {
                quat.rotateAroundY(Math.PI)
            }
            this.eventTipClick.dispatch({
                from: new TgdQuat(camera.orientation),
                to: quat,
            })
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
