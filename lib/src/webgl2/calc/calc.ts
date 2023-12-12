const EPSILON = 1e-12

export type Vector2 = [x: number, y: number]
export type Vector3 = [x: number, y: number, z: number]
export type Quaternion = [x: number, y: number, z: number, w: number]
export type Vector = Vector2 | Vector3 | Quaternion

export function isZero(x: number) {
    return Math.abs(x) < EPSILON
}

export function project(vector: Vector3, base: Vector3): number {
    const [vx, vy, vz] = vector
    const [bx, by, bz] = base
    const coeff = 1 / (bx * bx + by * by + bz * bz)
    return coeff * (vx * bx + vy * by + vz * bz)
}

export function vectorSquareLength(vec: number[]): number {
    return vec.reduce(
        (previousValue: number, currentValue: number) =>
            previousValue + currentValue * currentValue,
        0
    )
}

export function vectorLength(vec: number[]): number {
    return Math.sqrt(vectorSquareLength(vec))
}

export function normalize<T extends Vector>(vec: T): T {
    const result: T = [...vec]
    const squareLength = vectorSquareLength(vec)
    if (squareLength < EPSILON) {
        return result
    }

    const length = Math.sqrt(squareLength)
    return result.map((v) => v / length) as T
}

export function subtractVectors<T extends Vector>(a: T, b: T): T {
    return a.map((value, index) => value - b[index]) as T
}

export function addVectors<T extends Vector>(...vectors: T[]): T {
    const [first, ...rest] = vectors
    const result: T = [...first]
    for (const vector of rest) {
        for (let k = 0; k < result.length; k++) result[k] += vector[k]
    }
    return result
}

export function scaleVector<T extends Vector>(v: T, scale: number): T {
    return v.map((elem) => elem * scale) as T
}

export function computeBoundingBox(points: Vector3[]) {
    const [[x, y, z], ...rest] = points
    let minX = x
    let maxX = x
    let minY = y
    let maxY = y
    let minZ = z
    let maxZ = z
    for (const [xx, yy, zz] of rest) {
        minX = Math.min(minX, xx)
        maxX = Math.max(maxX, xx)
        minY = Math.min(minY, yy)
        maxY = Math.max(maxY, yy)
        minZ = Math.min(minZ, zz)
        maxZ = Math.max(maxZ, zz)
    }
    return {
        minX,
        maxX,
        minY,
        maxY,
        minZ,
        maxZ,
    }
}

export function crossProduct(vecA: Vector3, vecB: Vector3): Vector3 {
    const [xa, ya, za] = vecA
    const [xb, yb, zb] = vecB
    return [ya * zb - yb * za, xb * za - xa * zb, xa * yb - xb * ya]
}

export function clamp(value: number, min: number, max: number): number {
    if (value < min) return min
    if (value > max) return max
    return value
}

export function range(
    size: number,
    transfo?: (value: number) => number
): number[] {
    const arr: number[] = []
    if (transfo) for (let k = 0; k < size; k++) arr.push(transfo(k))
    else for (let k = 0; k < size; k++) arr.push(k)
    return arr
}

export function intervals(from: number, to: number, count: number): number[] {
    const arr: number[] = []
    if (count < 1) return arr

    const a = (to - from) / (count - 1)
    for (let i = 0; i < count; i++) {
        arr.push(from + i * a)
    }
    return arr
}
