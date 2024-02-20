import { TgdQuat, TgdVec3 } from "@tgd/math"

describe("math/quat.ts", () => {
    describe("TgdQuat.fromAxis()", () => {
        const cases: Array<
            [
                X: [number, number, number],
                Y: [number, number, number],
                Z: [number, number, number],
                Q: [number, number, number, number]
            ]
        > = [
            [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
                [0, 0, 0, 1],
            ],
            [
                [1, 0, 0],
                [0, 0, -1],
                [0, 1, 0],
                [-0.707106, 0, 0, 0.707106],
            ],

            [
                [1.0, 0.0, 0.0],
                [0.0, -0.504863, -0.863199],
                [0.0, 0.863199, -0.504863],
                [0.867428, 0, 0, -0.497562],
            ],
        ]
        const quat = new TgdQuat(0, 0, 0, 0)
        for (const [X, Y, Z, Q] of cases) {
            it(`should get ${str(Q)} from ${str(X)}, ${str(Y)} and ${str(
                Z
            )}`, () => {
                const axisX = new TgdVec3(...X)
                const axisY = new TgdVec3(...Y)
                const axisZ = new TgdVec3(...Z)
                quat.fromAxis(axisX, axisY, axisZ)
                const got = [quat.x, quat.y, quat.z, quat.w]
                const exp: number[] = [...Q]
                expect(got[0]).toBeCloseTo(exp[0], 5)
                expect(got[1]).toBeCloseTo(exp[1], 5)
                expect(got[2]).toBeCloseTo(exp[2], 5)
                expect(got[3]).toBeCloseTo(exp[3], 5)
            })
        }
    })
})

function str(input: Iterable<number>): string {
    const arr = Array.from(input)
    return `[${arr.map(n => `${n}`).join(", ")}]`
}
