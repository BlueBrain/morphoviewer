import { TgdCamera } from "@tgd/camera"
import { TgdDataset } from "@tgd/dataset"
import { TgdInputs } from "@tgd/input"
import {
    TgdResourceTexture2D,
    TgdResourceTextureCube,
    TgdResourceProgram,
} from "@tgd/resource"
import { TgdProgram } from "@tgd/types"
import { TgdVertexArray } from "@tgd/vao"
import { TgdPainterFunction } from "./painter"

export type TgdContextInterface = {
    readonly gl: WebGL2RenderingContext
    readonly canvas: HTMLCanvasElement
    readonly inputs: TgdInputs
    camera: TgdCamera
    readonly programs: TgdResourceProgram
    readonly textures2D: TgdResourceTexture2D
    readonly texturesCube: TgdResourceTextureCube
    createVAO(
        program?: TgdProgram,
        datasets?: TgdDataset[],
        elements?: Uint8Array | Uint16Array | Uint32Array
    ): TgdVertexArray
    takeSnapshot(target: HTMLCanvasElement): void
    paint: () => void
    onEnter: TgdPainterFunction | undefined
    onExit: TgdPainterFunction | undefined
}
