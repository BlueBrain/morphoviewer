import { CloudPainter } from "./painter/cloud/cloud-painter"

export enum AtlasCloudStatus {
    ToLoad,
    Loading,
    Ready,
}

export interface AtlasCloudOptions {
    color: [red: number, green: number, blue: number, alpha: number]
    /**
     * Every point in the cloud is represented by a sphere with this `radius`.
     */
    radius: number
}

export interface AtlasCloud extends AtlasCloudOptions {
    id: string
    status: AtlasCloudStatus
    visible: boolean
    painter?: CloudPainter
}
