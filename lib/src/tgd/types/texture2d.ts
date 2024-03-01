import { TgdProgram } from "./program"
import {
    WebglImage,
    WebglMagFilter,
    WebglMinFilter,
    WebglPixelStoreFormat,
    WebglTexParameter,
    WebglWrap,
} from "./webgl"

export interface TgdTexture2DOptions {
    wrapS?: WebglWrap
    wrapT?: WebglWrap
    wrapR?: WebglWrap
    minFilter?: WebglMinFilter
    magFilter?: WebglMagFilter
    generateMipMap?: boolean
    data?: Uint8Array
    image?: string | WebglImage
    width?: number
    height?: number
    internalFormat?: WebglPixelStoreFormat
    format?: WebglPixelStoreFormat
}

export interface TgdTexture2D {
    readonly glTexture: WebGLTexture
    readonly id: string
    readonly width: number
    readonly height: number
    readonly image: null | WebglImage
    bind(): void
    activate(program: TgdProgram, uniformName: string, slot?: number): void
    loadImage(image: string | WebglImage): void
    makePalette(colors: string[], columns?: number): void
    fillHorizontalGradient(size: number, ...colors: string[]): void
    fillverticalGradient(size: number, ...colors: string[]): void
    getParameter(param: WebglTexParameter): number | boolean | null
}
