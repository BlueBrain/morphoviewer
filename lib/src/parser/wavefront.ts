import { forEachLine } from "./for-each-line"

/**
 * This simple Wavefront parser only find the vertices positions
 * and the faces (provided they are triangles).
 * Textures and normals are discarded since we don't need them.
 */
export function parseWavefront(content: string): {
    vertices: [x: number, y: number, z: number][]
    faces: number[]
} {
    const vertices: [x: number, y: number, z: number][] = []
    const faces: number[] = []
    for (const line of forEachLine(content)) {
        if (line.startsWith("v ")) {
            const vertex = line
                .substring("v ".length)
                .split(" ")
                .map((v) => Number(v))
            if (isVector3(vertex)) vertices.push(vertex)
        }
        if (line.startsWith("f ")) {
            const face = line
                .substring("f ".length)
                .split(" ")
                // Warning! We need to remove 1 to the index.
                .map((v) => Number(v) - 1)
            if (isVector3(face)) faces.push(...face)
            else
                throw Error(
                    `This simple Wavefront parser accepts only triangles!\n${line}`
                )
        }
    }
    return { vertices, faces }
}

function isVector3(data: number[]): data is [number, number, number] {
    return data.length === 3
}
