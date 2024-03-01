import {
    TgdContext,
    TgdMeshData,
    TgdPainter,
    TgdPainterClear,
    TgdVec4,
} from "@tgd"

import { StampPainter } from "./stamp/stamp-painter"
import { TgdPainterFramebuffer } from "@/tgd/painter/framebuffer"
import { LayerPainter } from "./layer/layer-painter"

/**
 * Render a totaly opaque black and white mesh
 * with ghost material.
 */
export class GhostPainter extends TgdPainter {
    public readonly color = new TgdVec4()

    private readonly clear: TgdPainterClear
    private readonly stamp: StampPainter
    private readonly framebuffer: TgdPainterFramebuffer
    private readonly layer: LayerPainter

    constructor(private readonly context: TgdContext, mesh: TgdMeshData) {
        super()
        this.clear = new TgdPainterClear(context, {
            color: [0, 0, 0, 1],
            depth: 1,
        })
        this.stamp = new StampPainter(context, mesh)
        this.framebuffer = new TgdPainterFramebuffer(context, {
            viewportMatchingScale: 1,
            depthBuffer: true,
            minFilter: "NEAREST",
            magFilter: "NEAREST",
            wrapR: "CLAMP_TO_EDGE",
            wrapS: "CLAMP_TO_EDGE",
            wrapT: "CLAMP_TO_EDGE",
            internalFormat: "RGBA",
        })
        this.framebuffer.add(this.clear, this.stamp)
        this.layer = new LayerPainter(context)
    }

    public readonly paint = (time: number, delay: number) => {
        const { color, framebuffer, layer } = this
        framebuffer.paint(time, delay)
        layer.texture = framebuffer.texture
        layer.color.from(color)
        layer.paint()
    }

    delete(): void {
        this.stamp.delete()
        this.framebuffer.delete()
        this.layer.delete()
    }
}
