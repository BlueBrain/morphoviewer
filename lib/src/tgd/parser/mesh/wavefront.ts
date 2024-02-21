import { forEachLine } from "../for-each-line"

/**
 * This [Wavefront](https://en.wikipedia.org/wiki/Wavefront_.obj_file)
 * parser only finds the object name,
 * the vertices coords, the normals and the UVs.
 *
 * - There can be only one object per file.
 * - Normals and UVs are optional.
 * - All faces **must** be triangles.
 *
 * To export an obj file from blender, please use the following options:
 *
 * - Forward axis: **Y**
 * - Up axis: **Z**
 * - Object / Apply Modifiers: **True**
 * - Geometry / UV Coordinates: **True**
 * - Geometry / Normals: **True**
 * - Geometry / Triangulated Mesh: **True**
 */
export class TgdParserMeshWavefront {
    private name = "Mesh"
    private attPosition: number[] = []
    private attNormal: number[] = []
    private attUV: number[] = []
    private elements: number[] = []

    private elementIndex = 0
    private vertices: number[][] = []
    private normals: number[][] = []
    private uvs: number[][] = []
    private readonly map = new Map<string, number>()

    parse(content: string): {
        name: string
        count: number
        type: "UNSIGNED_BYTE" | "UNSIGNED_SHORT" | "UNSIGNED_INT"
        elements: Uint8Array | Uint16Array | Uint32Array
        attPosition: Float32Array
        attNormal?: Float32Array
        attUV?: Float32Array
    } {
        this.reset()
        const {
            onVertex,
            onNormal,
            onTexture,
            onFace,
            onObject,
            name,
            elements,
        } = this
        parse(content, { onVertex, onNormal, onTexture, onFace, onObject })
        const result: {
            name: string
            count: number
            attPosition: Float32Array
            attNormal?: Float32Array
            attUV?: Float32Array
        } = {
            name,
            count: Math.floor(elements.length / 3),
            attPosition: new Float32Array(this.attPosition),
        }
        if (this.attNormal.length > 0) {
            result.attNormal = new Float32Array(this.attNormal)
        }
        if (this.attUV.length > 0) {
            result.attUV = new Float32Array(this.attUV)
        }
        const { elementIndex } = this
        if (elementIndex <= 256) {
            return {
                ...result,
                type: "UNSIGNED_BYTE",
                elements: new Uint8Array(elements),
            }
        }
        if (elementIndex <= 0x10000) {
            return {
                ...result,
                type: "UNSIGNED_SHORT",
                elements: new Uint16Array(elements),
            }
        }
        return {
            ...result,
            type: "UNSIGNED_INT",
            elements: new Uint32Array(elements),
        }
    }

    private reset() {
        this.name = "Mesh"
        this.attPosition = []
        this.attNormal = []
        this.attUV = []
        this.elements = []
        this.elementIndex = 0
        this.vertices = []
        this.normals = []
        this.uvs = []
        this.map.clear()
    }

    private readonly onObject = (name: string) => {
        this.name = name
    }

    private readonly onVertex = (x: number, y: number, z: number) => {
        this.vertices.push([x, y, z])
    }

    private readonly onNormal = (x: number, y: number, z: number) => {
        this.normals.push([x, y, z])
    }

    private readonly onTexture = (u: number, v: number) => {
        this.uvs.push([u, v])
    }

    private readonly onFace = (vertices: V[]) => {
        if (vertices.length !== 3)
            throw Error("We can only deal with triangles!")

        vertices.forEach(v => this.elements.push(this.getElem(v)))
    }

    private getElem(v: V) {
        const k = this.key(v)
        const index = this.map.get(k) ?? -1
        if (index > -1) return index

        const [vx, vy, vz] = this.vertices[v.vertex]
        this.attPosition.push(vx, vy, vz)
        if (typeof v.normal === "number") {
            const [nx, ny, nz] = this.normals[v.normal]
            this.attNormal.push(nx, ny, nz)
        }
        if (typeof v.uv === "number") {
            const [tx, ty] = this.uvs[v.uv]
            this.attUV.push(tx, ty)
        }
        this.map.set(k, this.elementIndex)
        return this.elementIndex++
    }

    private key(v: V) {
        return `${v.vertex}/${v.normal}`
    }
}

interface TgdParserMeshWavefrontOptions {
    onVertex(x: number, y: number, z: number): void
    onNormal(x: number, y: number, z: number): void
    onTexture(u: number, v?: number, w?: number): void
    onFace(
        faces: Array<{
            vertex: number
            normal?: number
            uv?: number
        }>
    ): void
    onObject(name: string): void
    onGroup(name: string): void
}

interface V {
    vertex: number
    normal?: number
    uv?: number
}

function parse(
    content: string,
    options: Partial<TgdParserMeshWavefrontOptions> = {}
): void {
    const { onVertex, onNormal, onTexture, onFace, onObject } = options
    for (const fullLine of forEachLine(content)) {
        const line = fullLine.trimStart()
        if (onVertex && line.startsWith("v ")) {
            const vertex = line
                .substring("v ".length)
                .split(" ")
                .map(v => Number(v))
            if (isVector3(vertex)) onVertex(...vertex)
        } else if (onFace && line.startsWith("f ")) {
            onFace(
                line
                    .substring("f ".length)
                    .split(" ")
                    // Warning! We need to remove 1 to the index.
                    .map(face => {
                        const [v, t, n] = face.split("/")
                        return {
                            vertex: Number(v) - 1,
                            normal: n ? Number(n) - 1 : undefined,
                            uv: t ? Number(t) - 1 : undefined,
                        }
                    })
            )
        } else if (onNormal && line.startsWith("vn ")) {
            const normal = line
                .substring("vn ".length)
                .split(" ")
                .map(n => Number(n))
            if (isVector3(normal)) onNormal(...normal)
        } else if (onTexture && line.startsWith("vt ")) {
            const [u, v, w] = line
                .substring("vt ".length)
                .split(" ")
                .map(n => Number(n))
            onTexture(u, v, w)
        } else if (onObject && line.startsWith("o ")) {
            const name = line.substring("o ".length)
            onObject(name)
        }
    }
}

function isVector3(data: number[]): data is [number, number, number] {
    return data.length === 3
}