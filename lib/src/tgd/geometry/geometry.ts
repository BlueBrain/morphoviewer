import { TgdDataset } from "@tgd/dataset"
import { WebglDrawMode } from "@tgd/types"
import { TgdVec3 } from "@tgd/math"

export interface TgdGeometryOptions {
    dataset: TgdDataset
    drawMode: WebglDrawMode | number
    elements?:
        | {
              buff: BufferSource
              type: number
          }
        | Uint8Array
        | Uint16Array
        | Uint32Array
    attPosition?: string
    attNormal?: string
    attUV?: string
    /**
     * Compute normals with a smooth shading if
     * none has been provided.
     */
    computeNormalsIfMissing?: boolean
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
    public readonly count: number

    protected _dataset: TgdDataset
    protected _drawMode: WebglDrawMode | number
    protected _elementsBuff?: BufferSource
    protected _elementsType: number

    private readonly _elementsView: DataView

    constructor(options: TgdGeometryOptions) {
        const {
            dataset,
            drawMode,
            attPosition = "POSITION",
            attNormal = "NORMAL",
            attUV = "TEXCOORD_0",
        } = options
        this._dataset = dataset
        this._drawMode = drawMode
        const elements = convertElements(options.elements)
        this._elementsBuff = elements?.buff ?? undefined
        this._elementsType = elements?.type ?? 0
        this.attPosition = attPosition
        this.attNormal = attNormal
        this.attUV = attUV
        this.count = elements?.count ?? dataset.count
        if (!this._elementsBuff) {
            this._elementsView = new DataView(new ArrayBuffer(16))
        } else if (this._elementsBuff instanceof DataView) {
            this._elementsView = this._elementsBuff
        } else if (this._elementsBuff instanceof ArrayBuffer) {
            this._elementsView = new DataView(this._elementsBuff)
        } else {
            this._elementsView = new DataView(this._elementsBuff.buffer)
        }
        if (this._elementsType === WebGL2RenderingContext.UNSIGNED_BYTE) {
            this.getElement = this.getElementFrom8
        } else if (
            this._elementsType === WebGL2RenderingContext.UNSIGNED_SHORT
        ) {
            this.getElement = this.getElementFrom16
        } else if (this._elementsType === WebGL2RenderingContext.UNSIGNED_INT) {
            this.getElement = this.getElementFrom32
        } else {
            this.getElement = this.getElementFromNothing
        }
        if (options.computeNormalsIfMissing) {
            this.computeNormals()
        }
    }

    get dataset(): Readonly<TgdDataset> {
        return this._dataset
    }

    get drawMode() {
        return this._drawMode
    }

    get elementsBuff() {
        return this._elementsBuff
    }

    get elementsType() {
        return this._elementsType
    }

    public readonly getElement: (index: number) => number

    public computeNormals() {
        let normals: TgdVec3[] = []
        if (
            this.drawMode === WebGL2RenderingContext.TRIANGLES ||
            this.drawMode === "TRIANGLES"
        ) {
            normals = this.computeNormalsForTrianglesDrawMode()
        } else {
            console.error(
                "We don't know how to compute normals for this draw mode:",
                this.drawMode
            )
            return
        }
        this.dataset.addAttributes({
            NORMAL: "vec3",
        })
        const values: number[] = []
        for (let idx = 0; idx < normals.length; idx++) {
            const [nx, ny, nz] = normals[idx]
            values.push(nx, ny, nz)
        }
        this.dataset.set("NORMAL", new Float32Array(values))
    }

    // eslint-disable-next-line max-statements
    private computeNormalsForTrianglesDrawMode() {
        const ds = this.dataset
        const normalsAccumulator = new Map<number, TgdVec3>()
        const addNormal = (idx: number, A: TgdVec3, B: TgdVec3, C: TgdVec3) => {
            const norm = computeNormal(A, B, C)
            const item = normalsAccumulator.get(idx)
            if (item) {
                item.add(norm)
            } else {
                normalsAccumulator.set(idx, new TgdVec3(norm.x, norm.y, norm.z))
            }
        }
        const { get } = ds.getAttribAccessor(this.attPosition)
        const indexes = new Set<number>()
        let idxMax = 0
        for (let elem = 0; elem < this.count; elem += 3) {
            const idx0 = this.getElement(elem + 0)
            indexes.add(idx0)
            idxMax = Math.max(idxMax, idx0)
            const idx1 = this.getElement(elem + 1)
            indexes.add(idx1)
            idxMax = Math.max(idxMax, idx1)
            const idx2 = this.getElement(elem + 2)
            indexes.add(idx2)
            idxMax = Math.max(idxMax, idx2)
            const A = new TgdVec3(get(idx0, 0), get(idx0, 1), get(idx0, 2))
            const B = new TgdVec3(get(idx1, 0), get(idx1, 1), get(idx1, 2))
            const C = new TgdVec3(get(idx2, 0), get(idx2, 1), get(idx2, 2))
            addNormal(idx0, A, B, C)
            addNormal(idx1, B, C, A)
            addNormal(idx2, C, A, B)
        }
        const normals: TgdVec3[] = []
        for (let idx = 0; idx <= idxMax; idx++) {
            const item = normalsAccumulator.get(idx)
            if (!item) {
                normals.push(new TgdVec3())
            } else {
                item.normalize()
                normals.push(item)
            }
        }
        return normals
    }

    private readonly getElementFrom8 = (index: number): number => {
        return this._elementsView.getUint8(index)
    }

    private readonly getElementFrom16 = (index: number): number => {
        return this._elementsView.getUint16(index << 1, true)
    }

    private readonly getElementFrom32 = (index: number): number => {
        return this._elementsView.getUint32(index << 2, true)
    }

    private readonly getElementFromNothing = (): number => {
        return 0
    }
}

function convertElements(
    elements?:
        | {
              buff: BufferSource
              type: number
          }
        | Uint8Array
        | Uint16Array
        | Uint32Array
):
    | {
          buff: BufferSource
          type: number
          count: number
      }
    | undefined {
    if (!elements) return elements

    if (elements instanceof Uint16Array)
        return {
            buff: new DataView(elements.buffer),
            type: WebGL2RenderingContext.UNSIGNED_SHORT,
            count: elements.length,
        }
    if (elements instanceof Uint8Array)
        return {
            buff: new DataView(elements.buffer),
            type: WebGL2RenderingContext.UNSIGNED_BYTE,
            count: elements.length,
        }
    if (elements instanceof Uint32Array)
        return {
            buff: new DataView(elements.buffer),
            type: WebGL2RenderingContext.UNSIGNED_INT,
            count: elements.length,
        }
    let count = elements.buff.byteLength
    if (elements.type === WebGL2RenderingContext.UNSIGNED_SHORT) {
        count >>= 1
    } else if (elements.type === WebGL2RenderingContext.UNSIGNED_INT) {
        count >>= 2
    }
    return {
        ...elements,
        count,
    }
}

function computeNormal(A: TgdVec3, B: TgdVec3, C: TgdVec3) {
    const AB = new TgdVec3(B).subtract(A)
    const AC = new TgdVec3(C).subtract(A)
    return AB.cross(AC).normalize()
}
