import { flattenVec3IntoFloat32Array } from "../array"
import { Wgl2Attributes } from "../attributes"
import { center, crossProduct, normalize, subtractVectors } from "../calc"
import { Wgl2Vector3 } from "../types"

export interface Wgl2FactoryMeshData {
    attributes: Wgl2Attributes
    elements: Uint16Array | Uint32Array
    bbox: {
        center: Wgl2Vector3
        min: Wgl2Vector3
        max: Wgl2Vector3
    }
}

export class Wgl2FactoryMesh {
    private dirty = true
    private verticesNormals: Wgl2Vector3[] = []
    private trianglesNormals: Wgl2Vector3[] = []
    private attributes: Wgl2Attributes | null = null
    private elements: Uint16Array | Uint32Array | null = null
    private readonly bbox: {
        center: Wgl2Vector3
        min: Wgl2Vector3
        max: Wgl2Vector3
    } = {
        center: [0, 0, 0],
        min: [0, 0, 0],
        max: [0, 0, 0],
    }

    constructor(
        private readonly vertices: Wgl2Vector3[] = [],
        private readonly triangles: Wgl2Vector3[] = []
    ) {}

    get verticesCount() {
        return this.vertices.length
    }

    addVertex(vertex: [x: number, y: number, z: number]): number {
        const index = this.vertices.length
        this.vertices.push(vertex)
        this.dirty = true
        return index
    }

    addTriangle(triangle: [v1: number, v2: number, v3: number]): number {
        const index = this.triangles.length
        this.triangles.push(triangle)
        this.dirty = true
        return index
    }

    getData(): Wgl2FactoryMeshData {
        if (this.dirty || !this.attributes || !this.elements) {
            this.computeBoundingBox()
            this.computeNormals()
            this.attributes = new Wgl2Attributes({
                attPosition: 3,
                attNormal: 3,
            })
            this.attributes.set(
                "attPosition",
                flattenVec3IntoFloat32Array(this.vertices)
            )
            this.attributes.set(
                "attNormal",
                flattenVec3IntoFloat32Array(this.verticesNormals)
            )
            const count = this.triangles.length * 3
            const elements =
                this.vertices.length < 0xffff
                    ? new Uint16Array(count)
                    : new Uint32Array(count)
            this.triangles.forEach(([v0, v1, v2], i) => {
                const k = 3 * i
                elements[k + 0] = v0
                elements[k + 1] = v1
                elements[k + 2] = v2
            })
            this.elements = elements
            this.dirty = false
        }
        return {
            attributes: this.attributes,
            elements: this.elements,
            bbox: structuredClone(this.bbox),
        }
    }

    private computeBoundingBox() {
        let [[minX, minY, minZ]] = this.vertices
        let [maxX, maxY, maxZ] = [minX, minY, minZ]
        this.vertices.forEach(([x, y, z]) => {
            minX = Math.min(minX, x)
            maxX = Math.max(maxX, x)
            minY = Math.min(minY, y)
            maxY = Math.max(maxY, y)
            minZ = Math.min(minZ, z)
            maxZ = Math.max(maxZ, z)
        })
        const min = [minX, minY, minZ] as Wgl2Vector3
        const max = [maxX, maxY, maxZ] as Wgl2Vector3
        this.bbox.min = min
        this.bbox.max = max
        this.bbox.center = center(min, max)
        console.log("🚀 [mesh] this.bbox = ", this.bbox) // @FIXME: Remove this line written on 2024-01-16 at 17:59
    }

    private computeNormals() {
        const facesPerVertices = this.vertices.map(() => []) as number[][]
        const addFaceToVertex = (faceIndex: number, vertexIndex: number) => {
            const faces = facesPerVertices[vertexIndex] ?? []
            if (!faces.includes(faceIndex)) {
                faces.push(faceIndex)
            }
        }
        this.trianglesNormals = this.triangles.map(([i0, i1, i2], index) => {
            addFaceToVertex(index, i0)
            addFaceToVertex(index, i1)
            addFaceToVertex(index, i2)
            const v0 = this.vertices[i0]
            const v1 = this.vertices[i1]
            const v2 = this.vertices[i2]
            return normalize(
                crossProduct(subtractVectors(v1, v0), subtractVectors(v2, v0))
            )
        })
        this.verticesNormals = facesPerVertices.map(faces => {
            let x = 0
            let y = 0
            let z = 0
            for (const faceIndex of faces) {
                const [nx, ny, nz] = this.trianglesNormals[faceIndex]
                x += nx
                y += ny
                z += nz
            }
            return normalize([x, y, z])
        })
    }
}
