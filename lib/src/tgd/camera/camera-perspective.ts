import { TgdMat4, TgdVec3 } from "@tgd/math"
import { TgdCamera, TgdCameraOptions } from "./camera"

export interface TgdCameraPerspectiveOptions extends TgdCameraOptions {
    fovy?: number
}

export class TgdCameraPerspective extends TgdCamera {
    private readonly _matrixProjection = new TgdMat4()
    private _fovy = Math.PI / 4
    private readonly _ray = {
        origin: new TgdVec3(),
        direction: new TgdVec3(),
    }

    constructor(options: TgdCameraPerspectiveOptions = {}) {
        super(options)
        this._fovy = options.fovy ?? Math.PI / 4
    }

    copyProjectionFrom(camera: TgdCameraPerspective): this {
        this.fovy = camera.fovy
        this.near = camera.near
        this.far = camera.far
        return this
    }

    castRay(
        screenX: number,
        screenY: number
    ): Readonly<{ origin: TgdVec3; direction: TgdVec3 }> {
        const { origin, direction } = this._ray
        origin.from(this.position)
        const h = Math.atan(this.fovy)
        const w = h * this.screenAspectRatio
        direction
            .from(origin)
            .subtract(this.axisZ)
            .addWithScale(this.axisX, w * screenX)
            .addWithScale(this.axisY, h * screenY)
            .subtract(origin)
            .normalize()
        return this._ray
    }

    /**
     * Vertical field of view in radians.
     *
     * The revealed space at a distance of 1 from the camera
     * will have a height of `2 * tan(fovy / 2)`.
     */
    get fovy() {
        return this._fovy
    }
    set fovy(v: number) {
        if (v === this._fovy) return

        this._fovy = v
        this.dirtyProjection = true
    }
    get matrixProjection(): TgdMat4 {
        this.updateProjectionIfNeeded()
        return this._matrixProjection
    }

    protected getSpaceHeightAtTarget() {
        return 2 * Math.tan(this.fovy * 0.5) * this.distance
    }

    protected setSpaceHeightAtTarget(v: number) {
        this.distance = v / (2 * Math.tan(this.fovy * 0.5))
    }

    private updateProjectionIfNeeded(): void {
        if (!this.dirtyProjection) return

        const fovy = this._fovy
        const aspect = this.screenAspectRatio
        const near = this._near
        const far = this._far
        const out = this._matrixProjection
        const f = this.zoom / Math.tan(fovy / 2)
        out[0] = f / aspect
        out[1] = 0
        out[2] = 0
        out[3] = 0
        out[4] = 0
        out[5] = f
        out[6] = 0
        out[7] = 0
        out[8] = 0
        out[9] = 0
        out[11] = -1
        out[12] = 0
        out[13] = 0
        out[15] = 0
        if (far !== Infinity) {
            const nf = 1 / (near - far)
            out[10] = (far + near) * nf
            out[14] = 2 * far * near * nf
        } else {
            out[10] = -1
            out[14] = -2 * near
        }
        this.dirtyProjection = true
    }
}
