import { TgdDataset } from "@tgd/dataset"
import { TgdGeometry } from "./geometry"

export interface TgdGeometryBoxOptions {
    sizeX?: number
    sizeY?: number
    sizeZ?: number
}

export class TgdGeometryBox extends TgdGeometry {
    constructor({
        sizeX = 1,
        sizeY = 1,
        sizeZ = 1,
    }: TgdGeometryBoxOptions = {}) {
        const x = sizeX * 0.5
        const y = sizeY * 0.5
        const z = sizeZ * 0.5
        const dataset = new TgdDataset({
            POSITION: "vec3",
            NORMAL: "vec3",
            TEXCOORD_0: "vec2",
        })
        // prettier-ignore
        dataset.set("POSITION", new Float32Array([
            -x, +y, -z,
            +x, +y, +z,
            +x, +y, -z,
            +x, +y, +z,
            -x, -y, +z,
            +x, -y, +z,
            -x, +y, +z,
            -x, -y, -z,
            -x, -y, +z,
            +x, -y, -z,
            -x, -y, +z,
            -x, -y, -z,
            +x, +y, -z,
            +x, -y, +z,
            +x, -y, -z,
            -x, +y, -z,
            +x, -y, -z,
            -x, -y, -z,
            -x, +y, -z,
            -x, +y, +z,
            +x, +y, +z,
            +x, +y, +z,
            -x, +y, +z,
            -x, -y, +z,
            -x, +y, +z,
            -x, +y, -z,
            -x, -y, -z,
            +x, -y, -z,
            +x, -y, +z,
            -x, -y, +z,
            +x, +y, -z,
            +x, +y, +z,
            +x, -y, +z,
            -x, +y, -z,
            +x, +y, -z,
            +x, -y, -z,
        ]))
        // prettier-ignore
        dataset.set("TEXCOORD_0", new Float32Array([
            0.875, 0.5,
            0.625, 0.75,
            0.625, 0.5,
            0.625, 0.75,
            0.375, 1,
            0.375, 0.75,
            0.625, 0,
            0.375, 0.25,
            0.375, 0,
            0.375, 0.5,
            0.125, 0.75,
            0.125, 0.5,
            0.625, 0.5,
            0.375, 0.75,
            0.375, 0.5,
            0.625, 0.25,
            0.375, 0.5,
            0.375, 0.25,
            0.875, 0.5,
            0.875, 0.75,
            0.625, 0.75,
            0.625, 0.75,
            0.625, 1,
            0.375, 1,
            0.625, 0,
            0.625, 0.25,
            0.375, 0.25,
            0.375, 0.5,
            0.375, 0.75,
            0.125, 0.75,
            0.625, 0.5,
            0.625, 0.75,
            0.375, 0.75,
            0.625, 0.25,
            0.625, 0.5,
            0.375, 0.5,
        ]))
        // prettier-ignore
        dataset.set("NORMAL", new Float32Array([
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
        ]))
        super({
            dataset,
            drawMode: "TRIANGLES",
        })
    }
}
