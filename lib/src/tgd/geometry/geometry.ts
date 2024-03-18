import { TgdDataset } from "@tgd/dataset"
import { WebglDrawMode } from "@tgd/types"

export interface TgdGeometryOptions {
    dataset: TgdDataset
    drawMode: WebglDrawMode | number
    elements?: Uint8Array | Uint16Array | Uint32Array
    attPosition?: string
    attNormal?: string
    attUV?: string
}

/**
 * Geometry is used to define a mesh.
 * It must hold at least one vec3 attributes
 * for the vertices.
 */
export class TgdGeometry {
    public readonly attPosition: string
    public readonly attNormal: string
    public readonly attUV: string

    protected _dataset: TgdDataset
    protected _drawMode: WebglDrawMode | number
    protected _elements?: Uint8Array | Uint16Array | Uint32Array

    constructor({
        dataset,
        drawMode,
        elements,
        attPosition = "POSITION",
        attNormal = "NORMAL",
        attUV = "TEXCOORD_0",
    }: TgdGeometryOptions) {
        this._dataset = dataset
        this._drawMode = drawMode
        this._elements = elements
        this.attPosition = attPosition
        this.attNormal = attNormal
        this.attUV = attUV
    }

    get dataset(): Readonly<TgdDataset> {
        return this._dataset
    }

    get drawMode() {
        return this._drawMode
    }

    get elements() {
        return this._elements
    }
}
