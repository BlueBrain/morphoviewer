import { ArrayNumber4 } from ".."
import { TgdMat4 } from "./mat4"
import { TgdVec3 } from "./vec3"

export class TgdVec4 extends Float32Array {
    constructor()
    constructor(vec4: TgdVec4)
    constructor(vec3: TgdVec3, w: number)
    constructor(x: number)
    constructor(x: number, y: number)
    constructor(x: number, y: number, z: number)
    constructor(x: number, y: number, z: number, w: number)
    constructor(
        x: number | TgdVec4 | TgdVec3 = 0,
        y: number = 0,
        z: number = 0,
        w: number = 1
    ) {
        super(4)
        if (x instanceof TgdVec4) {
            this.x = x.x
            this.y = x.y
            this.z = x.z
            this.w = x.w
            return
        }
        if (x instanceof TgdVec3) {
            this.x = x.x
            this.y = x.y
            this.z = x.z
            this.w = w
            return
        }
        this.x = x
        this.y = y
        this.z = z
        this.w = w
    }

    reset(x = 0, y = 0, z = 0, w = 1): this {
        this.x = x
        this.y = y
        this.z = z
        this.w = w
        return this
    }

    from(vec: Readonly<TgdVec4 | ArrayNumber4>): this {
        const [x, y, z, w] = vec
        this.x = x
        this.y = y
        this.z = z
        this.w = w
        return this
    }

    clone() {
        return new TgdVec4(this)
    }

    isEqual(vec: Readonly<TgdVec4 | ArrayNumber4>) {
        const [x, y, z, w] = vec
        if (x !== this.x) return false
        if (y !== this.y) return false
        if (z !== this.z) return false
        if (w !== this.w) return false
        return true
    }

    isClose({ x, y, z, w }: TgdVec4, epsilon = 1e-6) {
        if (Math.abs(x - this.x) > epsilon) return false
        if (Math.abs(y - this.y) > epsilon) return false
        if (Math.abs(z - this.z) > epsilon) return false
        if (Math.abs(w - this.w) > epsilon) return false
        return true
    }

    /**
     * V := M×V
     */
    applyMatrix(mat: TgdMat4): this {
        const { x, y, z, w } = this
        this.x = x * mat.m00 + y * mat.m10 + z * mat.m20 + w * mat.m30
        this.y = x * mat.m01 + y * mat.m11 + z * mat.m21 + w * mat.m31
        this.z = x * mat.m02 + y * mat.m12 + z * mat.m22 + w * mat.m32
        this.w = x * mat.m03 + y * mat.m13 + z * mat.m23 + w * mat.m33
        return this
    }

    get x() {
        return this[0]
    }
    set x(value: number) {
        this[0] = value
    }

    get y() {
        return this[1]
    }
    set y(value: number) {
        this[1] = value
    }

    get z() {
        return this[2]
    }
    set z(value: number) {
        this[2] = value
    }

    get w() {
        return this[3]
    }
    set w(value: number) {
        this[3] = value
    }

    add(...vectors: (TgdVec4 | TgdVec3)[]): TgdVec4 {
        for (const vec of vectors) {
            this[0] += vec[0]
            this[1] += vec[1]
            this[2] += vec[2]
            if (vec.length > 3) this[3] += vec[3]
        }
        return this
    }

    subtract(vec: TgdVec4 | TgdVec3): TgdVec4 {
        this[0] -= vec[0]
        this[1] -= vec[1]
        this[2] -= vec[2]
        if (vec.length > 3) this[3] -= vec[3]
        return this
    }

    scale(factor: number): this {
        this[0] *= factor
        this[1] *= factor
        this[2] *= factor
        this[3] *= factor
        return this
    }

    dot(vec: TgdVec4): number {
        return (
            this[0] * vec[0] +
            this[1] * vec[1] +
            this[2] * vec[2] +
            this[3] * vec[3]
        )
    }

    get size() {
        return Math.sqrt(
            this[0] * this[0] +
                this[1] * this[1] +
                this[2] * this[2] +
                this[3] * this[3]
        )
    }

    normalize(): this {
        const squareLength =
            this[0] * this[0] +
            this[1] * this[1] +
            this[2] * this[2] +
            this[3] * this[3]
        if (squareLength === 0) return this

        return this.scale(1 / Math.sqrt(squareLength))
    }

    debug(caption = "vec4") {
        const { x, y, z, w } = this
        const out: string[] = [x, y, z, w].map(n => n.toFixed(6))
        console.log(`${caption}:   `, out.join(" | "))
    }
}
