import { TgdProgram } from "@tgd/types"
import { TgdBufferOptionTarget, TgdBufferOptionUsage } from "@tgd/buffer"

export type TgdDatasetType = "float" | "vec2" | "vec3" | "vec4"

export interface TgdDatasetOptions {
    divisor: number
    target: TgdBufferOptionTarget
    usage: TgdBufferOptionUsage
}

export class TgdDataset<
    T extends Record<string, TgdDatasetType> = Record<string, TgdDatasetType>
> {
    private readonly stride: number
    private readonly definitions: Record<
        keyof T,
        AttributeInternalRepresentation
    >
    private _data = new ArrayBuffer(0)
    private _count = 0

    public target: TgdBufferOptionTarget
    public usage: TgdBufferOptionUsage

    constructor(
        attributesDefinition: T,
        options: Partial<TgdDatasetOptions> = {}
    ) {
        this.target = options.target ?? "ARRAY_BUFFER"
        this.usage = options.usage ?? "STATIC_DRAW"
        const divisor = options.divisor ?? 0
        let stride = 0
        const data: { [key: string]: ArrayBuffer } = {}
        const definitions: Record<string, AttributeInternalRepresentation> = {}
        for (const key of Object.keys(attributesDefinition)) {
            const name = key as keyof T
            data[key] = new ArrayBuffer(0)
            const def: AttributeInternalRepresentation = {
                dimension: DIMS[attributesDefinition[name]],
                byteOffset: stride,
                bytesPerElement: Float32Array.BYTES_PER_ELEMENT,
                divisor,
                getter(view: DataView, byteOffset: number) {
                    if (byteOffset >= view.byteLength) {
                        byteOffset %= view.byteLength
                    }
                    return view.getFloat32(byteOffset, true)
                },
                setter(view: DataView, byteOffset: number, value: number) {
                    view.setFloat32(byteOffset, value, true)
                },
            }
            definitions[key] = def
            stride += def.bytesPerElement * def.dimension
        }
        this.definitions = definitions as Record<
            keyof T,
            AttributeInternalRepresentation
        >
        this.stride = stride
    }

    /**
     * Warning!
     *
     * This ArrayBuffer will be detached as soon as its
     * size is changed!
     */
    get data(): Readonly<ArrayBuffer> {
        return this._data
    }

    get count() {
        return this._count
    }
    set count(count: number) {
        if (this._count === count) return

        this._count = count
        this._data = resize(this._data, count * this.stride)
    }

    getAttribAccessor(attribName: string): {
        get: (index: number, dimension?: number) => number
        set: (value: number, index: number, dimension?: number) => void
    } {
        const def = this.getDef(attribName)
        const view = new DataView(this.data)
        const stride = this.stride
        return {
            get(index: number, dimension = 0): number {
                const byteOffset =
                    def.byteOffset +
                    stride * index +
                    dimension * def.bytesPerElement
                return def.getter(view, byteOffset)
            },
            set(value: number, index: number, dimension = 0): void {
                const byteOffset =
                    def.byteOffset +
                    stride * index +
                    dimension * def.bytesPerElement
                def.setter(view, byteOffset, value)
            },
        }
    }

    /**
     * Set the data for one attribute.
     *
     * If you try to set more element that the current buffer
     * can hold, the buffer will be expanded.
     * And the property `count` will change accordingly.
     *
     * @param attribName If the attribute does not exist,
     * you will get an exception.
     * @param value The ArrayBuffer holding the data you
     * want to set to this attribute
     * @param param2
     */
    set(
        attribName: keyof T,
        value: ArrayBuffer | Float32Array | { buffer: ArrayBuffer },
        {
            byteOffset = 0,
            byteStride,
            first = 0,
            count = Infinity,
            targetFirst = 0,
        }: Partial<{
            /**
             * First byte of meaningful data in this buffer.
             */
            byteOffset: number
            /**
             * Number of bytes between two elements.
             * If data is packed, you can leave it undefined.
             */
            byteStride: number
            /**
             * Index if the first source element.
             * Default to 0.
             */
            first: number
            /**
             * Maximum number of elements to store.
             * Default to Infinity.
             */
            count: number
            /**
             * Index if the first destination element.
             * Default to 0.
             */
            targetFirst: number
        }> = {}
    ) {
        const {
            bytesPerElement,
            dimension,
            byteOffset: attribByteOffset,
        } = this.getDef(attribName)
        const buffer = value instanceof ArrayBuffer ? value : value.buffer
        const chunkLength = bytesPerElement * dimension
        const srcStride = byteStride ?? chunkLength
        let srcOffset = byteOffset + srcStride * first
        const dstStride = this.stride
        let dstOffset = targetFirst * dstStride + attribByteOffset
        this.count = Math.max(
            this.count,
            Math.min(
                count,
                Math.floor((buffer.byteLength - srcOffset) / srcStride)
            )
        )
        const srcStop = buffer.byteLength - srcStride + 1
        const dstStop = this._data.byteLength + attribByteOffset - dstStride + 1
        const srcBuffer = new Uint8Array(buffer)
        const dstBuffer = new Uint8Array(this._data)
        let index = 0
        while (index < count && srcOffset < srcStop && dstOffset < dstStop) {
            dstBuffer.set(
                srcBuffer.subarray(srcOffset, srcOffset + chunkLength),
                dstOffset
            )
            index++
            srcOffset += srcStride
            dstOffset += dstStride
        }
    }

    private getDef(attribName: keyof T): AttributeInternalRepresentation {
        const def = this.definitions[attribName]
        if (!def)
            throw Error(
                `[TgdDataset] Attribute "${String(
                    attribName
                )}" not found in this DataSet!\nAvailable names are: ${Object.keys(
                    this.definitions
                )
                    .map(name => JSON.stringify(name))
                    .join(", ")}.`
            )
        return def
    }

    /**
     * Enable the vertex attrib array, and set
     * the vertex attrib pointer for every declared
     * attribute.
     */
    defineAttributes(gl: WebGL2RenderingContext, prg: TgdProgram) {
        let offsetDestination = 0
        const { definitions } = this
        for (const name of Object.keys(definitions)) {
            const def = definitions[name]
            if (prg.hasAttribute(name)) {
                const att = prg.getAttribLocation(name)
                gl.enableVertexAttribArray(att)
                gl.vertexAttribPointer(
                    att,
                    def.dimension,
                    gl.FLOAT,
                    false,
                    this.stride,
                    offsetDestination
                )
                gl.vertexAttribDivisor(att, def.divisor)
            }
            const bytes = def.dimension * def.bytesPerElement
            offsetDestination += bytes
        }
    }

    toCode({ indent = "" }: Partial<{ indent: string }> = {}) {
        const lines: string[] = []
        let offsetDestination = 0
        const { definitions } = this
        for (const name of Object.keys(definitions)) {
            const def = definitions[name]
            const att = `$${name}`
            lines.push(
                `const ${att} = gl.getAttribLocation(prg, "${name}")`,
                `gl.enableVertexAttribArray(${att})`,
                `gl.vertexAttribPointer(`,
                `  ${att},`,
                `  ${def.dimension},  // Dimension`,
                `  gl.FLOAT,`,
                `  false,`,
                `  ${this.stride},   // Stride`,
                `  ${offsetDestination}   // Offset`,
                `)`,
                `gl.vertexAttribDivisor(${att}, ${def.divisor})`
            )
            const bytes = def.dimension * def.bytesPerElement
            offsetDestination += bytes
        }
        return lines.map(line => `${indent}${line}`).join("\n")
    }
}

const DIMS: Record<TgdDatasetType, number> = {
    float: 1,
    vec2: 2,
    vec3: 3,
    vec4: 4,
}

interface AttributeInternalRepresentation {
    dimension: number
    bytesPerElement: number
    byteOffset: number
    divisor: number
    getter(this: void, view: DataView, byteOffset: number): number
    setter(this: void, view: DataView, byteOffset: number, value: number): void
}

function resizeFast(buff: ArrayBuffer, newSize?: number): ArrayBuffer {
    return buff.transfer(newSize)
}

function resizeSlow(inBuff: ArrayBuffer, newSize?: number): ArrayBuffer {
    const outBuff = new ArrayBuffer(newSize ?? inBuff.byteLength)
    new Uint8Array(outBuff).set(new Uint8Array(inBuff))
    return outBuff
}

const resize =
    typeof ArrayBuffer.prototype.transfer === "function"
        ? resizeFast
        : resizeSlow
