import { range } from "../calc"

export interface Wgl2TypeAttribute {
    type: "float"
    dimension: number
}

export type Wgl2TypeAttributesDefinitions = {
    [key: string]: Partial<Wgl2TypeAttribute> | number
}

interface AttributeInternalRepresentation {
    dimension: number
    divisor: number
    bytesPerElement: number
    bytesOffset: number
    getter(this: void, view: DataView, byteOffset: number): number
    setter(this: void, view: DataView, byteOffset: number, value: number): void
}

export enum Elem {
    X = 0,
    Y = 1,
    Z = 2,
    W = 3,
}
interface AttributesInternalRepresentations {
    [attribName: string]: AttributeInternalRepresentation
}

export class Wgl2Attributes {
    public readonly stride: number
    public buffer: WebGLBuffer | null = null

    private arrayBuffer: ArrayBuffer | null = null
    private readonly data: { [key: string]: ArrayBufferLike } = {}
    private readonly definitions: AttributesInternalRepresentations
    private verticeCount = 0

    constructor(
        def: Wgl2TypeAttributesDefinitions,
        public readonly divisor = 0
    ) {
        let stride = 0
        const data: { [key: string]: ArrayBuffer } = {}
        const definitions: AttributesInternalRepresentations = {}
        for (const key of Object.keys(def)) {
            data[key] = new ArrayBuffer(0)
            const dataDef = makeAttributeInternalRepresentation(
                def[key],
                divisor,
                stride
            )
            definitions[key] = dataDef
            stride += dataDef.bytesPerElement * dataDef.dimension
        }
        this.data = data
        this.definitions = definitions
        this.stride = stride
    }

    getVerticeCount() {
        return this.verticeCount
    }

    debug() {
        const { definitions, verticeCount: verticeCount } = this
        console.log("Vertices count:", verticeCount)
        const data = new Float32Array(this.get())
        console.log(data)
        for (const name of Object.keys(definitions)) {
            const def = definitions[name]
            console.log(
                name,
                range(verticeCount).map((index) =>
                    range(def.dimension).map((elem) =>
                        this.peek(name, index, elem)
                    )
                )
            )
        }
    }

    /**
     * @return List of the names of the attributes.
     */
    getNames(): string[] {
        return Object.keys(this.definitions)
    }

    getDefinitions(): Wgl2TypeAttributesDefinitions {
        return structuredClone(
            this.definitions
        ) as Wgl2TypeAttributesDefinitions
    }

    getAttribDef(
        attribName: string
    ): AttributeInternalRepresentation | undefined {
        const def = this.definitions[attribName]
        return def ? structuredClone(def) : undefined
    }

    getGlslType(attribName: string) {
        const def = this.definitions[attribName]
        if (!def) return `/* "${attribName}" not found! */`

        switch (def.dimension) {
            case 1:
                return "float"
            case 2:
                return "vec2"
            case 3:
                return "vec3"
            case 4:
                return "vec4"
            default:
                return `/* Don't know how to deal with dimension ${def.dimension}! */`
        }
    }

    get(verticeCount: number = 0): ArrayBuffer {
        const count = verticeCount > 0 ? verticeCount : this.verticeCount
        const byteLength = this.stride * count
        if (!this.arrayBuffer || this.arrayBuffer.byteLength < byteLength) {
            this.checkIfWeHaveEnoughData(count)
            this.arrayBuffer = new ArrayBuffer(byteLength)
            const viewDestination = new DataView(this.arrayBuffer)
            let offsetDestination = 0
            const { data, definitions } = this
            for (let vertex = 0; vertex < count; vertex++) {
                for (const key of Object.keys(definitions)) {
                    const def = definitions[key]
                    const buff: ArrayBufferLike = data[key]
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
        }
        return this.arrayBuffer
    }

    update(
        gl: WebGL2RenderingContext,
        verticeCount: number = 0,
        dynamic: boolean = false
    ) {
        const buffer = this.getBuffer()
        const count = verticeCount > 0 ? verticeCount : this.verticeCount
        const data = this.get(count)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            data,
            dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
        )
        return data
    }

    define(gl: WebGL2RenderingContext, prg: WebGLProgram) {
        const { buffer } = this
        if (buffer) gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        let offsetDestination = 0
        const { definitions } = this
        for (const name of Object.keys(definitions)) {
            const def = definitions[name]
            const att = gl.getAttribLocation(prg, name)
            if (att < 0) {
                throw Error(makeNotFoundAttributeError(name))
            }
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

    set(attribName: string, value: ArrayBuffer) {
        if (isObject(value) && value.buffer instanceof ArrayBuffer) {
            value = value.buffer
        }
        this.data[attribName] = value
        const { bytesPerElement, dimension } = this.definitions[attribName]
        this.verticeCount = Math.max(
            this.verticeCount,
            Math.ceil(value.byteLength / (bytesPerElement * dimension))
        )
        this.arrayBuffer = null
    }

    poke(
        attribName: string,
        vertexIndex: number,
        element: Elem,
        value: number
    ) {
        if (vertexIndex >= this.verticeCount) return

        const data = this.get(this.verticeCount)
        const view = new DataView(data)
        const { setter, bytesPerElement, bytesOffset } =
            this.definitions[attribName]
        const offset =
            bytesOffset + vertexIndex * this.stride + bytesPerElement * element
        setter(view, offset, value)
    }

    peek(attribName: string, vertexIndex: number, element: Elem) {
        if (vertexIndex >= this.verticeCount) return 0

        const data = this.get(this.verticeCount)
        const view = new DataView(data)
        const { getter, bytesPerElement, bytesOffset } =
            this.definitions[attribName]
        const offset =
            bytesOffset + vertexIndex * this.stride + bytesPerElement * element
        return getter(view, offset)
    }

    getBuffer(): WebGLBuffer {
        const { buffer } = this
        if (!buffer)
            throw Error(
                `Wgl2Attribute.buffer has not been set!\n${JSON.stringify(
                    this.definitions,
                    null,
                    "  "
                )}`
            )
        return buffer
    }

    private checkIfWeHaveEnoughData(verticeCount: number) {
        const { data, definitions } = this
        for (const key of Object.keys(definitions)) {
            const buff = data[key]
            if (!buff) {
                throw Error(
                    `No data has been set for attribute "${key}"!\nPlease use something like this:\n    data.set("${key}", new Float32Array([4, 3]))`
                )
            }
            const def = definitions[key]
            const byteLength =
                def.bytesPerElement * def.dimension * verticeCount
            if (buff.byteLength < byteLength) {
                throw Error(
                    `Attribute "${key}" has only ${buff.byteLength} bytes, but we need at least ${byteLength} since you asked for ${verticeCount} vertices!`
                )
            }
        }
    }
}

function makeAttributeInternalRepresentation(
    attribute: Partial<Wgl2TypeAttribute> | number,
    divisor: number,
    bytesOffset: number
): AttributeInternalRepresentation {
    const dataDef: Wgl2TypeAttribute =
        typeof attribute === "number"
            ? {
                  dimension: attribute,
                  type: "float",
              }
            : {
                  type: "float",
                  dimension: 1,
                  ...attribute,
              }

    switch (dataDef.type) {
        case "float":
            return makeDataDefinitionFloat(dataDef, divisor, bytesOffset)
        default:
            throw Error(
                `Unable to create a Data for an attribute of type "${
                    dataDef.type as string
                }"!`
            )
    }
}

function makeDataDefinitionFloat(
    dataDef: Wgl2TypeAttribute,
    divisor: number,
    bytesOffset: number
): AttributeInternalRepresentation {
    const bytesPerElement = Float32Array.BYTES_PER_ELEMENT
    return {
        dimension: dataDef.dimension,
        divisor,
        bytesPerElement,
        bytesOffset,
        getter(view: DataView, byteOffset: number) {
            return view.getFloat32(byteOffset, true)
        },
        setter(view: DataView, byteOffset: number, value: number) {
            view.setFloat32(byteOffset, value, true)
        },
    }
}

function isObject(data: unknown): data is Record<string, unknown> {
    if (!data) return false
    return typeof data === "object"
}

function makeNotFoundAttributeError(name: string): string {
    return `Unable to find atribute "${name}"!`
}
