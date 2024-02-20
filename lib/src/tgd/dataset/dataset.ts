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
    private readonly dataPerAttribute: Record<keyof T, ArrayBuffer>
    private readonly definitions: Record<
        keyof T,
        AttributeInternalRepresentation
    >
    private data: DataView | null = null

    public count = 0
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
                bytesOffset: stride,
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
        this.dataPerAttribute = data as Record<keyof T, ArrayBuffer>
        this.definitions = definitions as Record<
            keyof T,
            AttributeInternalRepresentation
        >
        this.stride = stride
    }

    set(attribName: keyof T, value: ArrayBuffer) {
        if (isObject(value) && value.buffer instanceof ArrayBuffer) {
            value = value.buffer
        }
        if (this.dataPerAttribute[attribName] === value) return

        this.dataPerAttribute[attribName] = value
        const { bytesPerElement, dimension } = this.definitions[attribName]
        this.count = Math.max(
            this.count,
            Math.ceil(value.byteLength / (bytesPerElement * dimension))
        )
        this.data = null
    }

    get(attribName: keyof T): ArrayBuffer {
        return this.dataPerAttribute[attribName] ?? new ArrayBuffer(0)
    }

    get dataView(): DataView {
        if (!this.data) {
            const data = new ArrayBuffer(this.stride * this.count)
            const viewDestination = new DataView(data)
            let offsetDestination = 0
            const { dataPerAttribute, definitions } = this
            for (let vertex = 0; vertex < this.count; vertex++) {
                for (const key of Object.keys(definitions)) {
                    const def = definitions[key]
                    const buff: ArrayBufferLike = dataPerAttribute[key]
                    const viewSource = new DataView(buff)
                    let offsetSource =
                        def.bytesPerElement * def.dimension * vertex
                    for (let dim = 0; dim < def.dimension; dim++) {
                        def.setter(
                            viewDestination,
                            offsetDestination,
                            def.getter(viewSource, offsetSource)
                        )
                        offsetSource += def.bytesPerElement
                        offsetDestination += def.bytesPerElement
                    }
                }
            }
            this.data = new DataView(data)
        }
        return this.data
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

function isObject(data: unknown): data is Record<string, unknown> {
    if (!data) return false
    return typeof data === "object"
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
    bytesOffset: number
    divisor: number
    getter(this: void, view: DataView, byteOffset: number): number
    setter(this: void, view: DataView, byteOffset: number, value: number): void
}
