import {
    TgdPainterGroup,
    TgdParserMeshWavefront,
    TgdMeshData,
    TgdPainterClear,
    TgdPainterDepth,
} from "@tgd"

import { AbstractCanvas, CanvasOptions } from "../abstract-canvas"
import { GhostPainter } from "./painter/ghost/ghost-painter"

type ColorRGBA = [red: number, green: number, blue: number, alpha: number]

export interface AtlasMeshGhostParams {
    color: ColorRGBA
    visible: boolean
}

interface MeshGhostItem {
    id: number
    params: AtlasMeshGhostParams
    data: TgdMeshData
    painter?: GhostPainter
}

export class AtlasCanvas extends AbstractCanvas {
    public backgroundColor: ColorRGBA = [0, 0, 0, 1]

    private idCounter = 1
    private readonly meshGhostGroup = new TgdPainterGroup()
    private readonly meshGhostItems = new Map<number, MeshGhostItem>()

    constructor(options: Partial<CanvasOptions> = {}) {
        super({
            cameraController: {
                minZoom: 0.1,
                maxZoom: 100,
                inertiaOrbit: 500,
                fixedTarget: true,
            },
            ...options,
        })
    }

    meshGhostLoadFromObj(
        content: string,
        params: Partial<AtlasMeshGhostParams> = {}
    ): number {
        const id = this.idCounter++
        const wavefrontParser = new TgdParserMeshWavefront()
        const data: TgdMeshData = wavefrontParser.parse(content, {
            computeNormals: true,
        })
        const item: MeshGhostItem = {
            id,
            params: {
                visible: true,
                color: [1, 1, 1, 1],
                ...params,
            },
            data,
        }
        this.meshGhostItems.set(id, item)
        this.registerPaintersForMeshGhosts()
        return id
    }

    meshGhostUnload(id: number): boolean {
        const item = this.meshGhostItems.get(id)
        if (!item) return false

        this.meshGhostItems.delete(id)
        const { painter } = item
        if (painter) {
            this.meshGhostGroup.remove(painter)
            painter.delete()
        }
        return true
    }

    meshGhostUpdate(
        id: number,
        params: Partial<AtlasMeshGhostParams> = {}
    ): boolean {
        const item = this.meshGhostItems.get(id)
        if (!item) return false

        item.params = {
            ...item.params,
            ...params,
        }
        const { painter } = item
        if (painter) {
            painter.active = item.params.visible
            painter.color.reset(...item.params.color)
        }
        return true
    }

    protected init(): void {
        const { canvas, context } = this
        if (!canvas || !context) return

        context.removeAll()
        const clear = new TgdPainterClear(context, {
            color: [0, 0, 0, 1],
            depth: 1,
        })
        // const depth = new TgdPainterDepth(context, {
        //     enabled: true,
        // })
        context.add(clear, /*depth,*/ this.meshGhostGroup)
        this.registerPaintersForMeshGhosts()
        context.paint()
    }

    /**
     * The client can call `meshGhostLoadFromObj` before the TgdContext
     * has been created.
     * That's why we don't create the actual painters at this time,
     * but we do it as soon as the context is here in this method:
     * `registerPaintersForMeshGhosts`.
     */
    private registerPaintersForMeshGhosts() {
        const { context, meshGhostGroup } = this
        if (!context) return

        for (const item of this.meshGhostItems.values()) {
            if (item.painter) continue

            const painter = new GhostPainter(context, item.data)
            meshGhostGroup.add(painter)
            item.painter = painter
            this.meshGhostUpdate(item.id, item.params)
        }
        context.paint()
    }

    // protected readonly paint = (context: TgdContext, time: number) => {
    //     const { layerPainter, framebufferFactory, smoothness, highlight } = this
    //     if (!layerPainter || !framebufferFactory) return

    //     const { gl } = context
    //     framebufferFactory.unbindFramebuffer()
    //     gl.clearColor(...this.backgroundColor)
    //     gl.clear(gl.COLOR_BUFFER_BIT)
    //     gl.disable(gl.BLEND)
    //     this.clouds.forEach(cloud => {
    //         const { painter } = cloud
    //         if (!cloud.visible || !painter) return

    //         painter.color.reset(...cloud.color)
    //         painter.radius = cloud.radius
    //         painter.paint(this._camera)
    //     })
    //     gl.disable(gl.DEPTH_TEST)
    //     gl.depthMask(false)
    //     this.meshes.forEach(mesh => {
    //         const { paint } = mesh
    //         if (!mesh.visible || !paint) return

    //         framebufferFactory.bindFramebuffer()
    //         gl.disable(gl.BLEND)
    //         gl.enable(gl.DEPTH_TEST)
    //         gl.clearColor(0, 0, 0, 0)
    //         gl.clearDepth(1)
    //         gl.depthFunc(gl.LESS)
    //         gl.depthMask(true)
    //         gl.depthRange(0, 1)
    //         gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    //         paint(this._camera, mesh, time)
    //         framebufferFactory.unbindFramebuffer()
    //         layerPainter.paint(
    //             framebufferFactory.getTexture(),
    //             this.meshColor.reset(...mesh.color),
    //             smoothness,
    //             highlight
    //         )
    //     })
    // }
}
