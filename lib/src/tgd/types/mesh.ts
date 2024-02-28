export interface TgdMeshData {
    name: string
    count: number
    type: "UNSIGNED_BYTE" | "UNSIGNED_SHORT" | "UNSIGNED_INT"
    elements: Uint8Array | Uint16Array | Uint32Array
    attPosition: Float32Array
    attNormal?: Float32Array
    attUV?: Float32Array
}
