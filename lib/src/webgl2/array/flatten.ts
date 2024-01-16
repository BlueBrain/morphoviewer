import { Wgl2Vector3 } from "../types"

export function flattenVec3IntoFloat32Array(arr: Wgl2Vector3[]): Float32Array {
    const data = new Float32Array(arr.length * 3)
    arr.forEach(([v0, v1, v2], i) => {
        const k = i * 3
        data[k + 0] = v0
        data[k + 1] = v1
        data[k + 2] = v2
    })
    return data
}

export function flattenVec3IntoUint8Array(arr: Wgl2Vector3[]): Uint8Array {
    const data = new Uint8Array(arr.length * 3)
    arr.forEach(([v0, v1, v2], i) => {
        const k = i * 3
        data[k + 0] = v0
        data[k + 1] = v1
        data[k + 2] = v2
    })
    return data
}

export function flattenVec3IntoUint16Array(arr: Wgl2Vector3[]): Uint16Array {
    const data = new Uint16Array(arr.length * 3)
    arr.forEach(([v0, v1, v2], i) => {
        const k = i * 3
        data[k + 0] = v0
        data[k + 1] = v1
        data[k + 2] = v2
    })
    return data
}

export function flattenVec3IntoUint32Array(arr: Wgl2Vector3[]): Uint32Array {
    const data = new Uint32Array(arr.length * 3)
    arr.forEach(([v0, v1, v2], i) => {
        const k = i * 3
        data[k + 0] = v0
        data[k + 1] = v1
        data[k + 2] = v2
    })
    return data
}
