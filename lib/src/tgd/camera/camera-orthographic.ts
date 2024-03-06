import { TgdMat4, TgdVec3 } from "@tgd/math"
import { TgdCamera, TgdCameraOptions } from "./camera"

export interface TgdCameraOrthographicOptions extends TgdCameraOptions {
    spaceHeight?: number
}

export class TgdCameraOrthographic extends TgdCamera {
    private readonly _matrixProjection = new TgdMat4()
    private _spaceHeight = 10
    private readonly _ray = {
        origin: new TgdVec3(),
        direction: new TgdVec3(),
    }

    constructor(options: TgdCameraOrthographicOptions = {}) {
        super(options)
        this.spaceHeight = options.spaceHeight ?? 10
    }

    copyProjectionFrom(camera: TgdCameraOrthographic): this {
        this.spaceHeight = camera.spaceHeight
        return this
    }

    castRay(
        screenX: number,
        screenY: number
    ): Readonly<{ origin: TgdVec3; direction: TgdVec3 }> {
        const { origin, direction } = this._ray
        direction.from(this.axisZ)
        const h = this.spaceHeight * 0.5
        const w = h * this.screenAspectRatio
        origin
            .from(this.position)
            .addWithScale(this.axisX, w * screenX)
            .addWithScale(this.axisY, h * screenY)
        return this._ray
    }

    get spaceHeight() {
        return this._spaceHeight
    }
    set spaceHeight(v: number) {
        if (v === this._spaceHeight) return

        this._spaceHeight = v
        this.dirtyProjection = true
    }

    get near() {
        return this._near
    }
    set near(v: number) {
        if (v === this._near) return

        this._near = v
        this.dirtyProjection = true
    }

    get far() {
        return this._far
    }
    set far(v: number) {
        if (v === this._far) return

        this._far = v
        this.dirtyProjection = true
    }

    get matrixProjection(): TgdMat4 {
        this.updateProjectionIfNeeded()
        return this._matrixProjection
    }

    protected getSpaceHeightAtTarget() {
        return this.spaceHeight
    }

    protected setSpaceHeightAtTarget(v: number) {
        this.spaceHeight = v
    }

    private updateProjectionIfNeeded(): void {
        if (!this.dirtyProjection) return

        const { near, far, screenAspectRatio, _spaceHeight, zoom } = this
        const top = _spaceHeight / (zoom + zoom)
        const bottom = -top
        const right = top * screenAspectRatio
        const left = -right
        const out = this._matrixProjection
        const lr = 1 / (left - right)
        const bt = 1 / (bottom - top)
        const nf = 1 / (near - far)
        out[0] = -2 * lr
        out[1] = 0
        out[2] = 0
        out[3] = 0
        out[4] = 0
        out[5] = -2 * bt
        out[6] = 0
        out[7] = 0
        out[8] = 0
        out[9] = 0
        out[10] = nf
        out[11] = 0
        out[12] = (left + right) * lr
        out[13] = (top + bottom) * bt
        out[14] = near * nf
        out[15] = 1
        this.dirtyProjection = true
    }
}
