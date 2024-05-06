import { padColOfNumbers } from "@tgd/debug"
import { TgdMat3 } from "./mat3"
import { TgdQuat } from "./quat"
import { TgdVec3 } from "./vec3"
import { TgdVec4 } from "./vec4"
import { ArrayNumber16 } from ".."
/**
 * Column-first 4x4 matrix.
 *
 * `m23` means column 2 and row 3.
 *
 * This is not the same as what mathematicians are used to,
 * but its how WebGL will store matrices in memory.
 */
export class TgdMat4 extends Float32Array {
    constructor()
    constructor(mat: TgdMat4)
    constructor(
        m00: number,
        m01: number,
        m02: number,
        m03: number,
        m10: number,
        m11: number,
        m12: number,
        m13: number,
        m20: number,
        m21: number,
        m22: number,
        m23: number,
        m30: number,
        m31: number,
        m32: number,
        m33: number
    )
    constructor(
        m00: number | TgdMat4 = 1,
        m01: number = 0,
        m02: number = 0,
        m03: number = 0,
        m10: number = 0,
        m11: number = 1,
        m12: number = 0,
        m13: number = 0,
        m20: number = 0,
        m21: number = 0,
        m22: number = 1,
        m23: number = 0,
        m30: number = 0,
        m31: number = 0,
        m32: number = 0,
        m33: number = 1
    ) {
        if (typeof m00 === "number") {
            super([
                m00,
                m01,
                m02,
                m03,
                m10,
                m11,
                m12,
                m13,
                m20,
                m21,
                m22,
                m23,
                m30,
                m31,
                m32,
                m33,
            ])
        } else {
            super(m00)
        }
    }

    multiply(mat4: TgdMat4): this {
        // prettier-ignore
        const [
            a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23,
            a30, a31, a32, a33,
        ] = this
        // prettier-ignore
        const [
            b00, b01, b02, b03,
            b10, b11, b12, b13,
            b20, b21, b22, b23,
            b30, b31, b32, b33,
        ] = mat4
        this.m00 = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03
        this.m10 = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13
        this.m20 = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23
        this.m30 = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33
        this.m01 = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03
        this.m11 = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13
        this.m21 = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23
        this.m31 = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33
        this.m02 = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03
        this.m12 = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13
        this.m22 = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23
        this.m32 = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33
        this.m03 = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03
        this.m13 = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13
        this.m23 = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23
        this.m33 = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33
        return this
    }

    /**
     * @param from This matrix will become the inversion of `from`.
     * If not defined, the matrix will invert itself.
     */
    // eslint-disable-next-line max-statements
    invert(from?: TgdMat4): this {
        // prettier-ignore
        const [
            a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23,
            a30, a31, a32, a33,
        ] =from ?? this
        const b00 = a00 * a11 - a01 * a10
        const b01 = a00 * a12 - a02 * a10
        const b02 = a00 * a13 - a03 * a10
        const b03 = a01 * a12 - a02 * a11
        const b04 = a01 * a13 - a03 * a11
        const b05 = a02 * a13 - a03 * a12
        const b06 = a20 * a31 - a21 * a30
        const b07 = a20 * a32 - a22 * a30
        const b08 = a20 * a33 - a23 * a30
        const b09 = a21 * a32 - a22 * a31
        const b10 = a21 * a33 - a23 * a31
        const b11 = a22 * a33 - a23 * a32
        // Calculate the determinant
        const det =
            b00 * b11 -
            b01 * b10 +
            b02 * b09 +
            b03 * b08 -
            b04 * b07 +
            b05 * b06
        if (!det) {
            return this
        }
        const invDet = 1.0 / det

        this[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet
        this[1] = (a02 * b10 - a01 * b11 - a03 * b09) * invDet
        this[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet
        this[3] = (a22 * b04 - a21 * b05 - a23 * b03) * invDet
        this[4] = (a12 * b08 - a10 * b11 - a13 * b07) * invDet
        this[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet
        this[6] = (a32 * b02 - a30 * b05 - a33 * b01) * invDet
        this[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet
        this[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet
        this[9] = (a01 * b08 - a00 * b10 - a03 * b06) * invDet
        this[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet
        this[11] = (a21 * b02 - a20 * b04 - a23 * b00) * invDet
        this[12] = (a11 * b07 - a10 * b09 - a12 * b06) * invDet
        this[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet
        this[14] = (a31 * b01 - a30 * b03 - a32 * b00) * invDet
        this[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet
        return this
    }

    get translation(): TgdVec3 {
        const { m30, m31, m32 } = this
        return new TgdVec3(m30, m31, m32)
    }
    set translation(vec: TgdVec3 | TgdVec4) {
        this.m30 = vec.x
        this.m31 = vec.y
        this.m32 = vec.z
    }

    from(mat: TgdMat4 | ArrayNumber16): this {
        // prettier-ignore
        const [
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33,
        ] = mat
        this.m00 = m00
        this.m01 = m01
        this.m02 = m02
        this.m03 = m03
        this.m10 = m10
        this.m11 = m11
        this.m12 = m12
        this.m13 = m13
        this.m20 = m20
        this.m21 = m21
        this.m22 = m22
        this.m23 = m23
        this.m30 = m30
        this.m31 = m31
        this.m32 = m32
        this.m33 = m33
        return this
    }

    fromMat3(mat: TgdMat3 | TgdMat4): this {
        this.m00 = mat.m00
        this.m01 = mat.m01
        this.m02 = mat.m02
        this.m10 = mat.m10
        this.m11 = mat.m11
        this.m12 = mat.m12
        this.m20 = mat.m20
        this.m21 = mat.m21
        this.m22 = mat.m22
        return this
    }

    toAxis(axisX: TgdVec3, axisY: TgdVec3, axisZ: TgdVec3): this {
        this.toAxisX(axisX)
        this.toAxisY(axisY)
        return this.toAxisZ(axisZ)
    }

    toAxisX(axisX: TgdVec3): this {
        axisX.x = this.m00
        axisX.y = this.m01
        axisX.z = this.m02
        return this
    }

    toAxisY(axisY: TgdVec3): this {
        axisY.x = this.m10
        axisY.y = this.m11
        axisY.z = this.m12
        return this
    }

    toAxisZ(axisZ: TgdVec3): this {
        axisZ.x = this.m20
        axisZ.y = this.m21
        axisZ.z = this.m22
        return this
    }

    fromQuat({ x, y, z, w }: TgdQuat): this {
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

    /**
     * Col 0, row 0.
     */
    get m00() {
        return this[0]
    }
    /**
     * Col 0, row 0.
     */
    set m00(v: number) {
        this[0] = v
    }

    /**
     * Col 0, row 1.
     */
    get m01() {
        return this[1]
    }
    /**
     * Col 0, row 1.
     */
    set m01(v: number) {
        this[1] = v
    }

    /**
     * Col 0, row 2.
     */
    get m02() {
        return this[2]
    }
    /**
     * Col 0, row 2.
     */
    set m02(v: number) {
        this[2] = v
    }

    /**
     * Col 0, row 3.
     */
    get m03() {
        return this[3]
    }
    /**
     * Col 0, row 3.
     */
    set m03(v: number) {
        this[3] = v
    }

    /**
     * Col 1, row 0.
     */
    get m10() {
        return this[4]
    }
    /**
     * Col 1, row 0.
     */
    set m10(v: number) {
        this[4] = v
    }

    /**
     * Col 1, row 1.
     */
    get m11() {
        return this[5]
    }
    /**
     * Col 1, row 1.
     */
    set m11(v: number) {
        this[5] = v
    }

    /**
     * Col 1, row 2.
     */
    get m12() {
        return this[6]
    }
    /**
     * Col 1, row 2.
     */
    set m12(v: number) {
        this[6] = v
    }

    /**
     * Col 1, row 3.
     */
    get m13() {
        return this[7]
    }
    /**
     * Col 1, row 3.
     */
    set m13(v: number) {
        this[7] = v
    }

    /**
     * Col 2, row 0.
     */
    get m20() {
        return this[8]
    }
    /**
     * Col 2, row 0.
     */
    set m20(v: number) {
        this[8] = v
    }

    /**
     * Col 2, row 1.
     */
    get m21() {
        return this[9]
    }
    /**
     * Col 2, row 1.
     */
    set m21(v: number) {
        this[9] = v
    }

    /**
     * Col 2, row 2.
     */
    get m22() {
        return this[10]
    }
    /**
     * Col 2, row 2.
     */
    set m22(v: number) {
        this[10] = v
    }

    /**
     * Col 2, row 3.
     */
    get m23() {
        return this[11]
    }
    /**
     * Col 2, row 3.
     */
    set m23(v: number) {
        this[11] = v
    }

    /**
     * Col 3, row 0.
     */
    get m30() {
        return this[12]
    }
    /**
     * Col 3, row 0.
     */
    set m30(v: number) {
        this[12] = v
    }

    /**
     * Col 3, row 1.
     */
    get m31() {
        return this[13]
    }
    /**
     * Col 3, row 1.
     */
    set m31(v: number) {
        this[13] = v
    }

    /**
     * Col 3, row 2.
     */
    get m32() {
        return this[14]
    }
    /**
     * Col 3, row 2.
     */
    set m32(v: number) {
        this[14] = v
    }

    /**
     * Col 3, row 3.
     */
    get m33() {
        return this[15]
    }
    /**
     * Col 3, row 3.
     */
    set m33(v: number) {
        this[15] = v
    }

    debug(caption = "Mat4") {
        const c0 = padColOfNumbers([this.m00, this.m01, this.m02, this.m03])
        const c1 = padColOfNumbers([this.m10, this.m11, this.m12, this.m13])
        const c2 = padColOfNumbers([this.m20, this.m21, this.m22, this.m23])
        const c3 = padColOfNumbers([this.m30, this.m31, this.m32, this.m33])

        console.log(caption)
        console.log("   ", [c0[0], c1[0], c2[0], c3[0]].join(" | "))
        console.log("   ", [c0[1], c1[1], c2[1], c3[1]].join(" | "))
        console.log("   ", [c0[2], c1[2], c2[2], c3[2]].join(" | "))
        console.log("   ", [c0[3], c1[3], c2[3], c3[3]].join(" | "))
    }
}
