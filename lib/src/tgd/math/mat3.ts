import { padColOfNumbers } from "@tgd/debug"
import { TgdQuat, TgdVec3 } from "."

/**
 * Column-first 4x4 matrix.
 *
 * `m23` means column 2 and row 3.
 *
 * This is not the same as what mathematicians are used to,
 * but its how WebGL will store matrices in memory.
 */
export class TgdMat3 extends Float32Array {
    constructor()
    constructor(mat: TgdMat3)
    constructor(
        m00: number,
        m01: number,
        m02: number,
        m10: number,
        m11: number,
        m12: number,
        m20: number,
        m21: number,
        m22: number
    )
    constructor(
        m00: number | TgdMat3 = 1,
        m01: number = 0,
        m02: number = 0,
        m10: number = 0,
        m11: number = 1,
        m12: number = 0,
        m20: number = 0,
        m21: number = 0,
        m22: number = 1
    ) {
        if (typeof m00 === "number") {
            super([m00, m01, m02, m10, m11, m12, m20, m21, m22])
        } else {
            super(m00)
        }
    }

    transpose(): TgdMat3 {
        let tmp = this.m10
        this.m10 = this.m01
        this.m01 = tmp
        tmp = this.m20
        this.m20 = this.m02
        this.m02 = tmp
        tmp = this.m21
        this.m21 = this.m12
        this.m12 = tmp
        return this
    }

    fromQuat({ x, y, z, w }: TgdQuat): TgdMat3 {
        const x2 = x + x
        const y2 = y + y
        const z2 = z + z
        const xx = x * x2
        const yx = y * x2
        const yy = y * y2
        const zx = z * x2
        const zy = z * y2
        const zz = z * z2
        const wx = w * x2
        const wy = w * y2
        const wz = w * z2

        this.m00 = 1 - yy - zz
        this.m10 = yx - wz
        this.m20 = zx + wy

        this.m01 = yx + wz
        this.m11 = 1 - xx - zz
        this.m21 = zy - wx

        this.m02 = zx - wy
        this.m12 = zy + wx
        this.m22 = 1 - xx - yy

        return this
    }

    toAxis(axisX: TgdVec3, axisY: TgdVec3, axisZ: TgdVec3) {
        this.toAxisX(axisX)
        this.toAxisY(axisY)
        return this.toAxisZ(axisZ)
    }

    toAxisX(axisX: TgdVec3) {
        axisX.x = this.m00
        axisX.y = this.m01
        axisX.z = this.m02
        return this
    }

    toAxisY(axisY: TgdVec3) {
        axisY.x = this.m10
        axisY.y = this.m11
        axisY.z = this.m12
        return this
    }

    toAxisZ(axisZ: TgdVec3) {
        axisZ.x = this.m20
        axisZ.y = this.m21
        axisZ.z = this.m22
        return this
    }

    scale(factor: number): this {
        this[0] *= factor
        this[1] *= factor
        this[2] *= factor
        this[3] *= factor
        this[4] *= factor
        this[5] *= factor
        this[6] *= factor
        this[7] *= factor
        this[8] *= factor
        return this
    }

    get m00() {
        return this[0]
    }
    set m00(v: number) {
        this[0] = v
    }

    get m01() {
        return this[1]
    }
    set m01(v: number) {
        this[1] = v
    }

    get m02() {
        return this[2]
    }
    set m02(v: number) {
        this[2] = v
    }

    get m10() {
        return this[3]
    }
    set m10(v: number) {
        this[3] = v
    }

    get m11() {
        return this[4]
    }
    set m11(v: number) {
        this[4] = v
    }

    get m12() {
        return this[5]
    }
    set m12(v: number) {
        this[5] = v
    }

    get m20() {
        return this[6]
    }
    set m20(v: number) {
        this[6] = v
    }

    get m21() {
        return this[7]
    }
    set m21(v: number) {
        this[7] = v
    }

    get m22() {
        return this[8]
    }
    set m22(v: number) {
        this[8] = v
    }

    debug(caption = "Mat3") {
        const c0 = padColOfNumbers([this.m00, this.m01, this.m02])
        const c1 = padColOfNumbers([this.m10, this.m11, this.m12])
        const c2 = padColOfNumbers([this.m20, this.m21, this.m22])

        console.log(caption)
        console.log("   ", [c0[0], c1[0], c2[0]].join(" | "))
        console.log("   ", [c0[1], c1[1], c2[1]].join(" | "))
        console.log("   ", [c0[2], c1[2], c2[2]].join(" | "))
    }
}
