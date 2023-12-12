import { Wgl2Attributes } from "./attributes"

describe("data.ts", () => {
    const data = new Wgl2Attributes({
        xy: 2,
        z: 1,
    })
    data.set("xy", new Float32Array([11, 12, 21, 22]))
    data.set("z", new Float32Array([1, 2]))
    const got = new Float32Array(data.get(2))
    const exp = new Float32Array([11, 12, 1, 21, 22, 2])
    it(`should interleave floats`, () => {
        expect(got).toEqual(exp)
    })
})
