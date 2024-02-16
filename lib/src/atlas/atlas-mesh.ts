import { TgdCameraOrthographic } from "@tolokoban/tgd"

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
        camera: TgdCameraOrthographic,
        options: AtlasMeshOptions,
        time: number
    ) => void
}
