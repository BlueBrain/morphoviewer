import { TgdVec3 } from "./vec3"

describe("tgd/math/vec3.ts", () => {
    describe("TgdVec3.distanceToLineSquared()", () => {
        const cases: Array<
            [
                [number, number, number],
                [number, number, number],
                [number, number, number],
                number
            ]
        > = [
            [[4, 3, 0], [17, 0, 0], [1, 0, 0], 3 * 3],
            [[4, 3, 0], [0, -23, 0], [0, 1, 0], 4 * 4],
            [[4, 3, 0], [-4, 0, 0], [-1, 0, 0], 3 * 3],
            [[4, 3, 0], [0, -9, 0], [0, -1, 0], 4 * 4],
            [[4, 3, 0], [0, 0, 0], [0, 0, 1], 4 * 4 + 3 * 3],
        ]
        for (const [[mx, my, mz], [ox, oy, oz], [dx, dy, dz], exp] of cases) {
            it(`distance between (${mx}, ${my}, ${mz}) and line (${ox}, ${oy}, ${oz})->(${dx}, ${dy}, ${dz}) should be ${exp}`, () => {
                const M = new TgdVec3(mx, my, mz)
                const O = new TgdVec3(ox, oy, oz)
                const D = new TgdVec3(dx, dy, dz)
                const got = M.distanceToLineSquared(O, D)
                expect(got).toBeCloseTo(exp, 6)
            })
        }
    })
})
