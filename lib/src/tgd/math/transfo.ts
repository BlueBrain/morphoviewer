import { ArrayNumber16, ArrayNumber3, ArrayNumber4 } from "../types"
import { TgdMat4 } from "./mat4"
import { TgdQuat } from "./quat"
import { TgdVec3 } from "./vec3"
import { TgdVec4 } from "./vec4"

export class TgdTransfo {
    // prettier-ignore
    private readonly _matrix = new TgdMat4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    )
    private readonly _position = new TgdVec3(0, 0, 0)
    private readonly _orientation = new TgdQuat(0, 0, 0, 1)
    private readonly _scale = new TgdVec3(1, 1, 1)

    private dirty = false
    private _updateCount = 0

    get updateCount() {
        return this._updateCount
    }

    get matrix(): Readonly<TgdMat4> {
        if (this.dirty) {
            const m = this._matrix
            m.m03 = 0
            m.m13 = 0
            m.m23 = 0
            m.m33 = 1
            const [tx, ty, tz] = this._position
            m.m30 = tx
            m.m31 = ty
            m.m32 = tz
            m.fromQuat(this._orientation)
            const [sx, sy, sz] = this._scale
            m.m00 *= sx
            m.m01 *= sx
            m.m03 *= sx
            m.m10 *= sy
            m.m11 *= sy
            m.m13 *= sy
            m.m20 *= sz
            m.m21 *= sz
            m.m23 *= sz
            this.dirty = false
        }
        return this._matrix
    }
    set matrix(value: Readonly<TgdMat4> | ArrayNumber16) {
        this._matrix.from(value)
        this._updateCount++
        this.dirty = false
    }

    get position(): Readonly<TgdVec3> {
        return this._position
    }
    set position(value: Readonly<TgdVec3 | TgdVec4 | ArrayNumber3>) {
        this.setDirty()
        this._position.from(value)
    }
    setPosition(x: number, y: number, z: number): this {
        this.setDirty()
        this._position.reset(x, y, z)
        return this
    }

    get scale(): Readonly<TgdVec3> {
        return this._scale
    }
    set scale(value: Readonly<TgdVec3 | ArrayNumber3>) {
        this.setDirty()
        this._scale.from(value)
    }
    setScale(x: number, y: number, z: number): this {
        this.setDirty()
        this._scale.reset(x, y, z)
        return this
    }

    get orientation(): Readonly<TgdQuat> {
        return this._orientation
    }
    set orientation(quat: Readonly<TgdQuat | ArrayNumber4>) {
        this.setDirty()
        this._orientation.from(quat)
    }
    setOrientation(x: number, y: number, z: number, w: number) {
        this.setDirty()
        this._orientation.reset(x, y, z, w)
    }

    private setDirty() {
        this._updateCount++
        this.dirty = true
    }
}
