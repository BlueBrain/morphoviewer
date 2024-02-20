import { TgdMat4 } from "@tgd/math"
import { TgdCamera } from "./camera"

export class TgdCameraOrthographic extends TgdCamera {
    private readonly _matrixProjection = new TgdMat4()
    private _spaceHeight = 10
    private _near = 1e-3
    private _far = 1e3

    constructor() {
        super()
    }

    copyProjectionFrom(camera: TgdCameraOrthographic): this {
        this.spaceHeight = camera.spaceHeight
        return this
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

    private updateProjectionIfNeeded(): void {
        if (!this.dirtyProjection) return

        const { near, far, screenAspectRatio, _spaceHeight } = this
        const top = _spaceHeight * 0.5
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
