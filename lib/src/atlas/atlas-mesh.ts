import { Wgl2Camera } from "@/webgl2/camera"

export enum AtlasMeshStatus {
    ToLoad,
    Loading,
    Ready,
}

export interface AtlasMeshOptions {
    color: [red: number, green: number, blue: number, alpha: number]
}

export interface AtlasMesh extends AtlasMeshOptions {
    id: string
    content: string
    status: AtlasMeshStatus
    visible: boolean
    paint?: (
        camera: Wgl2Camera,
        options: AtlasMeshOptions,
        time: number
    ) => void
}
