import { vec3 } from "gl-matrix"

export class Wgl2DirtyVector3 {
    private _x = 0
    private _y = 0
    private _z = 0

    constructor(
        private readonly onChange: (me: Wgl2DirtyVector3) => void,
        x = 0,
        y = 0,
        z = 0
    ) {
        this._x = x
        this._y = y
        this._z = z
    }

    set([x, y, z]: Iterable<number>) {
        this._x = x
        this._y = y
        this._z = z
        this.onChange(this)
    }

    setYZX([x, y, z]: Iterable<number>) {
        this._x = y
        this._y = z
        this._z = x
        this.onChange(this)
    }

    asArray(): [number, number, number] {
        return [this._x, this._y, this._z]
    }

    asVec3(): vec3 {
        return vec3.fromValues(this._x, this._y, this._z)
    }

    get x() {
        return this._x
    }
    set x(value: number) {
        if (value === this._x) return
        this._x = value
        this.onChange(this)
    }
    get y() {
        return this._y
    }
    set y(value: number) {
        if (value === this._y) return
        this._y = value
        this.onChange(this)
    }
    get z() {
        return this._z
    }
    set z(value: number) {
        if (value === this._z) return
        this._z = value
        this.onChange(this)
    }
}
