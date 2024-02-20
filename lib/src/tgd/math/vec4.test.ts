import { TgdMat4, TgdVec4 } from "."

describe("math/vec4.ts", () => {
    describe("Vec4.applyMatrix()", () => {
        it("should multiply", () => {
            // prettier-ignore
            const M = new TgdMat4(
                1,  2,  3,  4,
                5,  6,  7,  8,
                9, 10, 11, 12,
               13, 14, 15, 16
            )
            const V = new TgdVec4(10, 20, 30, 40)
            V.applyMatrix(M)
            const got = [...V]
            const exp = [900, 1000, 1100, 1200]
            expect(got).toEqual(exp)
        })
    })
})
