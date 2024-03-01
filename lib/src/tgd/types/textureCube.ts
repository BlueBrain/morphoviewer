import { TgdProgram } from "./program"
import type { WebglImage } from "./webgl"

export interface TgdTextureCubeOptions {
    /**
     * When you look at this image the
     *
     * - Right points toward `-Z`
     * - Top points toward `-Y`
     */
    imagePosX: string | WebglImage
    /**
     * When you look at this image the
     *
     * - Right points toward `+Z`
     * - Top points toward `-Y`
     */
    imageNegX: string | WebglImage
    /**
     * When you look at this image the
     *
     * - Right points toward `+X`
     * - Top points toward `+Z`
     */
    imagePosY: string | WebglImage
    /**
     * When you look at this image the
     *
     * - Right points toward `+X`
     * - Top points toward `-Z`
     */
    imageNegY: string | WebglImage
    /**
     * When you look at this image the
     *
     * - Right points toward `+X`
     * - Top points toward `-Y`
     */
    imagePosZ: string | WebglImage
    /**
     * When you look at this image the
     *
     * - Right points toward `-X`
     * - Top points toward `-Y`
     */
    imageNegZ: string | WebglImage
}

export interface TgdTextureCube {
    /**
     * TextureCube is ready only when the 6 images hve been loaded.
     */
    readonly ready: boolean
    bind(): void
    activate(program: TgdProgram, uniformName: string, slot?: number): void
}
