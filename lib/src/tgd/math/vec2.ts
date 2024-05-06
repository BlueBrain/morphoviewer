import { ArrayNumber2 } from ".."
import { mix } from "../utils/math"
import { TgdVec3 } from "./vec3"
import { TgdVec4 } from "./vec4"

export class TgdVec2 extends Float32Array {
    static fromMix(
        v1: TgdVec2 | TgdVec3 | TgdVec4,
        v2: TgdVec2 | TgdVec3 | TgdVec4,
        a = 0.5
    ): TgdVec2 {
        const b = 1 - a
        const x = b * v1.x + a * v2.x
        const y = b * v1.y + a * v2.y
        return new TgdVec2(x, y)
    }

    static distance(
        from: TgdVec2 | TgdVec3 | TgdVec4,
        to: TgdVec2 | TgdVec3 | TgdVec4
    ): number {
        const x = to.x - from.x
        const y = to.y - from.y
        return Math.sqrt(x * x + y * y)
    }

    constructor()
    constructor(x: Readonly<TgdVec2 | ArrayNumber2>)
    constructor(x: number)
    constructor(x: number, y: number)
    constructor(
        x: number | Readonly<TgdVec2 | ArrayNumber2> = 0,
        y: number = 0
    ) {
        super(2)
        if (typeof x !== "number") {
            this.x = x[0]
            this.y = x[1]
            return
        }
        this.x = x
        this.y = y
    }

    clone() {
        return new TgdVec2(this)
    }

    isEqual(vec: Readonly<TgdVec2 | ArrayNumber2>) {
        const [x, y] = vec
        if (x !== this.x) return false
        if (y !== this.y) return false
        return true
    }

    isClose(vec: Readonly<TgdVec2 | ArrayNumber2>, epsilon = 1e-6) {
        const [x, y] = vec
        if (Math.abs(x - this.x) > epsilon) return false
        if (Math.abs(y - this.y) > epsilon) return false
        return true
    }

    from(vec: Readonly<TgdVec2 | TgdVec4 | ArrayNumber2>): this {
        const [x, y] = vec
        this.x = x
        this.y = y
        return this
    }

    fromMix(
        a: TgdVec2 | TgdVec3 | TgdVec4,
        b: TgdVec2 | TgdVec3 | TgdVec4,
        t: number
    ): this {
        const [ax, ay] = a
        const [bx, by] = b
        return this.reset(mix(ax, bx, t), mix(ay, by, t))
    }

    reset(x: number, y: number): this {
        this[0] = x
        this[1] = y
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

    add(...vectors: (TgdVec2 | TgdVec3 | TgdVec4)[]): this {
        for (const vec of vectors) {
            this[0] += vec.x
            this[1] += vec.y
        }
        return this
    }

    addWithScale(vec: TgdVec2 | TgdVec3 | TgdVec4, scale: number): this {
        this[0] += vec.x * scale
        this[1] += vec.y * scale
        return this
    }

    subtract(vec: Readonly<TgdVec2 | TgdVec3 | TgdVec4 | ArrayNumber2>): this {
        this[0] -= vec[0]
        this[1] -= vec[1]
        return this
    }

    scale(factor: number): this {
        this[0] *= factor
        this[1] *= factor
        return this
    }

    dot(vec: Readonly<TgdVec2 | TgdVec3 | TgdVec4 | ArrayNumber2>): number {
        return this[0] * vec[0] + this[1] * vec[1]
    }

    get size() {
        return Math.sqrt(this[0] * this[0] + this[1] * this[1])
    }

    normalize(): this {
        const squareLength = this[0] * this[0] + this[1] * this[1]
        if (squareLength === 0) return this

        return this.scale(1 / Math.sqrt(squareLength))
    }

    /**
     * Set random values between -0.5 and +0.5 to each coordinate.
     */
    random(): this {
        this[0] = Math.random() - 0.5
        this[1] = Math.random() - 0.5
        return this
    }

    debug(caption = "vec2") {
        const { x, y } = this
        const out: string[] = [x, y].map(n => n.toFixed(6))
        console.log(
            `${caption}:   `,
            out.join(" | "),
            "   length:",
            Math.sqrt(x * x + y * y)
        )
    }
}
