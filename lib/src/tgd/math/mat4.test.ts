import { TgdMat4 } from "./mat4"

type Vec16 = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
]

describe("math/mat4.ts", () => {
    describe("Mat4.multiply()", () => {
        // prettier-ignore
        const cases: Array<[a: Vec16, b: Vec16, ab: Vec16]>=[
            [
                [
                    1, 5, 9, 13,
                    2, 6, 10, 14,
                    3, 7, 11, 15,
                    4, 8, 12, 16
                ],[
                    4, 15, -5, 16,
                    3, -55, -59, 88,
                    1, 15, -23, 12,
                    9, 3, -9, 9
                ],[
                    83, 203, 323,443,
                    68, -24, -116, -208,
                    10, 30, 50, 70,
                    24, 72, 120, 168
                ]
            ]
        ]
        for (const [a, b, ab] of cases) {
            it("should multiply", () => {
                const got = [...new TgdMat4(...a).multiply(new TgdMat4(...b))]
                const exp = ab
                expect(got).toEqual(exp)
            })
        }
    })
    describe("Mat4.invert()", () => {
        it("should invert", () => {
            // prettier-ignore
            const mat = new TgdMat4(
                1, 0, 0, -1,
                -5, 1, 1, -2,
                -2, 74, 1, -3,
                1, -5, 0, 1
            )
            mat.invert()
            expect(mat[0]).toBeCloseTo(17 / 39, 6)
            expect(mat[1]).toBeCloseTo(-5 / 156, 6)
            expect(mat[2]).toBeCloseTo(5 / 156, 6)
            expect(mat[3]).toBeCloseTo(73 / 156, 6)
            expect(mat[4]).toBeCloseTo(-1 / 39, 6)
            expect(mat[5]).toBeCloseTo(-1 / 78, 6)
            expect(mat[6]).toBeCloseTo(1 / 78, 6)
            expect(mat[7]).toBeCloseTo(-1 / 78, 6)
            expect(mat[8]).toBeCloseTo(14 / 13, 6)
            expect(mat[9]).toBeCloseTo(41 / 52, 6)
            expect(mat[10]).toBeCloseTo(11 / 52, 6)
            expect(mat[11]).toBeCloseTo(171 / 52, 6)
            expect(mat[12]).toBeCloseTo(-22 / 39, 6)
            expect(mat[13]).toBeCloseTo(-5 / 156, 6)
            expect(mat[14]).toBeCloseTo(5 / 156, 6)
            expect(mat[15]).toBeCloseTo(73 / 156, 6)
        })
    })
})
