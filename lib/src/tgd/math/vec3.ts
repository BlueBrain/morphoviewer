import { TgdMat3 } from "./mat3"
import { TgdMat4 } from "./mat4"
import { TgdVec4 } from "./vec4"

type Arr3 = TgdVec3 | [x: number, y: number, z: number]
export class TgdVec3 extends Float32Array {
    constructor()
    constructor(x: Arr3)
    constructor(x: number)
    constructor(x: number, y: number)
    constructor(x: number, y: number, z: number)
    constructor(x: number | Arr3 = 0, y: number = 0, z: number = 0) {
        super(3)
        if (typeof x !== "number") {
            this.x = x[0]
            this.y = x[1]
            this.z = x[2]
            return
        }
        this.x = x
        this.y = y
        this.z = z
    }

    clone() {
        return new TgdVec3(this)
    }

    isEqual([x, y, z]: Arr3) {
        if (x !== this.x) return false
        if (y !== this.y) return false
        if (z !== this.z) return false
        return true
    }

    isClose([x, y, z]: Arr3, epsilon = 1e-6) {
        if (Math.abs(x - this.x) > epsilon) return false
        if (Math.abs(y - this.y) > epsilon) return false
        if (Math.abs(z - this.z) > epsilon) return false
        return true
    }

    rotateAround(axis: Arr3, angleInRadians: number) {
        // result := V.cos(a) + (KxV).sin(a) + K(K.V)(1 - cos(a))
        const C = Math.cos(angleInRadians)
        const S = Math.sin(angleInRadians)
        const [Vx, Vy, Vz] = this
        const [Kx, Ky, Kz] = axis
        const dot = Vx * Kx + Vy * Ky + Vz * Kz
        const crossX = Ky * Vz - Kz * Vy
        const crossY = Kz * Vx - Kx * Vz
        const crossZ = Kx * Vy - Ky * Vx
        const a = dot * (1 - C)
        this.x = Vx * C + crossX * S + Kx * a
        this.y = Vy * C + crossY * S + Ky * a
        this.z = Vz * C + crossZ * S + Kz * a
        return this
    }

    /**
     * V := M×V
     */
    applyMatrix(mat: TgdMat3 | TgdMat4): this {
        const { x, y, z } = this
        this.x = x * mat.m00 + y * mat.m10 + z * mat.m20
        this.y = x * mat.m01 + y * mat.m11 + z * mat.m21
        this.z = x * mat.m02 + y * mat.m12 + z * mat.m22
        return this
    }

    from([x, y, z]: Arr3): this {
        this.x = x
        this.y = y
        this.z = z
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

    add(...vectors: Arr3[]): this {
        for (const vec of vectors) {
            this[0] += vec[0]
            this[1] += vec[1]
            this[2] += vec[2]
        }
        return this
    }

    addWithScale([x, y, z]: Arr3, scale = 1): this {
        this[0] += x * scale
        this[1] += y * scale
        this[2] += z * scale
        return this
    }

    subtract(vec: Arr3): this {
        this[0] -= vec[0]
        this[1] -= vec[1]
        this[2] -= vec[2]
        return this
    }

    scale(factor: number): this {
        this[0] *= factor
        this[1] *= factor
        this[2] *= factor
        return this
    }

    dot(vec: Arr3): number {
        return this[0] * vec[0] + this[1] * vec[1] + this[2] * vec[2]
    }

    get size() {
        return Math.sqrt(
            this[0] * this[0] + this[1] * this[1] + this[2] * this[2]
        )
    }

    normalize(): this {
        const squareLength =
            this[0] * this[0] + this[1] * this[1] + this[2] * this[2]
        if (squareLength === 0) return this

        return this.scale(1 / Math.sqrt(squareLength))
    }

    cross([x2, y2, z2]: Arr3) {
        const [x1, y1, z1] = this
        this[0] = y1 * z2 - y2 * z1
        this[1] = z1 * x2 - z2 * x1
        this[2] = x1 * y2 - x2 * y1
    }

    /**
     * Set random values between -0.5 and +0.5 to each coordinate.
     */
    random(): this {
        this[0] = Math.random() - 0.5
        this[1] = Math.random() - 0.5
        this[2] = Math.random() - 0.5
        return this
    }

    debug(caption = "vec3") {
        const { x, y, z } = this
        const out: string[] = [x, y, z].map(n => n.toFixed(6))
        console.log(
            `${caption}:   `,
            out.join(" | "),
            "   length:",
            Math.sqrt(x * x + y * y + z * z)
        )
    }
}
