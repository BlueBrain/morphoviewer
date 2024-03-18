import { TgdCamera, TgdCameraPerspective } from "@tgd/camera"
import { TgdContext, TgdContextOptions } from "@tgd/context"
import { TgdControllerCameraOrbit } from "@tgd/controller"
import { TgdEvent } from "@tgd/event"
import { TgdQuat, TgdMat3, TgdVec3 } from "@tgd/math"
import { TgdPainterClear, TgdPainterDepth } from "@tgd/painter"
import { TgdInputPointerEventTap } from "@tgd/types"
import { TipsPainter } from "./painter/tips"

export interface TgdCanvasGizmoOptions extends TgdContextOptions {
    canvas?: HTMLCanvasElement
}

/**
 * The Gizmo displays the orientation of an attached camera.
 * You can click one of the axis to force the camera to face it.
 */
export class TgdCanvasGizmo {
    /**
     * The user clicked a tip, so we dispatch the target orientation.
     */
    public eventTipClick = new TgdEvent<{
        from: Readonly<TgdQuat>
        to: Readonly<TgdQuat>
    }>()

    private _canvas: HTMLCanvasElement | null = null
    private context: TgdContext | null = null
    private cameraExternal: TgdCamera | null = null
    private readonly cameraInternal = new TgdCameraPerspective({
        fovy: Math.PI / 3,
        distance: 2.7,
        near: 0.01,
        far: 10,
    })
    private orbiter: TgdControllerCameraOrbit | null = null
    private tipsPainter: TipsPainter | null = null

    constructor(private readonly options: TgdCanvasGizmoOptions = {}) {
        if (options.canvas) this.canvas = options.canvas
    }

    /**
     * Attach the camera we want to track and control.
     */
    attachCamera(camera: TgdCamera) {
        this.detach()
        this.cameraExternal = camera
        this.attach()
    }

    detach() {
        const camera = this.cameraExternal
        if (camera) {
            camera.eventTransformChange.removeListener(
                this.handleExternalToInternal
            )
            this.cameraExternal = null
        }
    }

    private attach() {
        const camera = this.cameraExternal
        if (camera)
            camera.eventTransformChange.addListener(
                this.handleExternalToInternal
            )
        this.context?.paint()
    }

    private readonly handleExternalToInternal = (externalCamera: TgdCamera) => {
        this.cameraInternal.orientation = externalCamera.orientation
    }

    private readonly handleInternalToExternal = (internalCamera: TgdCamera) => {
        const { cameraExternal } = this
        if (cameraExternal) {
            cameraExternal.orientation = internalCamera.orientation
        }
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
            const { orbiter } = this
            if (orbiter) {
                orbiter.detach()
                orbiter.eventChange.removeListener(
                    this.handleInternalToExternal
                )
            }
        }
        this.tipsPainter?.delete()
        if (!canvas) return

        const context = new TgdContext(canvas, {
            alpha: true,
            depth: true,
            antialias: true,
            name: "GizmoCanvas",
            ...this.options,
        })
        context.inputs.pointer.eventTap.addListener(this.handleTap)
        this.context = context
        context.camera = this.cameraInternal
        this.orbiter = new TgdControllerCameraOrbit(context, {
            speedPanning: 0,
            speedZoom: 0,
        })
        this.orbiter.eventChange.addListener(this.handleInternalToExternal)
        const painter = new TipsPainter(context)
        this.tipsPainter = painter
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
        const camera = this.context?.camera
        if (!camera) return

        const { origin, direction } = camera.castRay(evt.x, evt.y)
        const maxDist = 1
        let bestDist = maxDist
        let bestTip = TIPS[0]
        for (const tip of TIPS) {
            const dist = tip.distanceToLineSquared(origin, direction)
            if (dist < bestDist) {
                bestDist = dist
                bestTip = tip
            }
        }
        if (bestDist < maxDist) {
            const axisX = new TgdVec3()
            const axisY = new TgdVec3()
            const axisZ = bestTip
            axisX.from(this.findAxisX())
            if (axisX.isClose(axisZ)) {
                axisY.from(this.findAxisY())
                axisX.from(axisY).cross(axisZ)
            } else {
                axisY.from(axisZ).cross(axisX)
            }
            const quat = new TgdQuat().fromAxis(axisX, axisY, axisZ)
            if (quat.isEqual(camera.orientation)) {
                quat.rotateAroundY(Math.PI)
            }
            this.eventTipClick.dispatch({
                from: new TgdQuat(camera.orientation),
                to: quat,
            })
        }
    }

    private findAxisX(): TgdVec3 {
        let bestScore = 0
        let bestTip = TIPS[0]
        const vec = new TgdVec3()
        const mat = new TgdMat3()
        mat.fromQuat(this.cameraInternal.orientation).transpose()
        for (const tip of TIPS) {
            vec.from(tip).applyMatrix(mat)
            if (vec.x > bestScore) {
                bestScore = vec.x
                bestTip = tip
            }
        }
        return bestTip
    }

    private findAxisY(): TgdVec3 {
        let bestScore = 0
        let bestTip = TIPS[0]
        const vec = new TgdVec3()
        const mat = new TgdMat3()
        mat.fromQuat(this.cameraInternal.orientation).transpose()
        for (const tip of TIPS) {
            vec.from(tip).applyMatrix(mat)
            if (vec.y > bestScore) {
                bestScore = vec.y
                bestTip = tip
            }
        }
        return bestTip
    }
}

const TIPS: TgdVec3[] = [
    new TgdVec3(1, 0, 0),
    new TgdVec3(0, 1, 0),
    new TgdVec3(0, 0, 1),
    new TgdVec3(-1, 0, 0),
    new TgdVec3(0, -1, 0),
    new TgdVec3(0, 0, -1),
]
