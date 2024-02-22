import { TgdPainterClear, TgdQuat, TgdVec3, TgdVec4 } from "@tgd"

import { Wgl2FactoryFrameBuffer } from "../webgl2/factory/frame-buffer"
import { AtlasMesh, AtlasMeshOptions, AtlasMeshStatus } from "./atlas-mesh"
import { AbstractCanvas, CanvasOptions } from "../abstract-canvas"
import { MeshPainter } from "./painter/mesh/mesh-painter"
import { LayerPainter } from "./painter/layer/layer-painter"
import { CloudPainter } from "./painter/cloud/cloud-painter"
import { AtlasCloud, AtlasCloudOptions, AtlasCloudStatus } from "./atlas-cloud"

export interface AtlasCanvasOptions extends CanvasOptions {
    loadWaveFrontMesh(id: string): Promise<string>
    /**
     * @returns Position of every point of the cloud.
     * Format: `[x0, y0, z0, x1, y1, z1, ...]`
     */
    loadCloud(id: string): Promise<Float32Array>
}

export class AtlasCanvas extends AbstractCanvas {
    public backgroundColor: [
        red: number,
        green: number,
        blue: number,
        alpha: number
    ] = [0, 0, 0, 1]

    private readonly clouds = new Map<string, AtlasCloud>()
    private readonly meshes = new Map<string, AtlasMesh>()
    private readonly loadCloud?: (id: string) => Promise<Float32Array>
    private readonly loadWaveFrontMesh?: (id: string) => Promise<string>
    private readonly meshColor = new TgdVec4()

    private framebufferFactory: Wgl2FactoryFrameBuffer | null = null
    private layerPainter: LayerPainter | null = null
    private _smoothness = 0.5
    private _highlight = 0.5

    constructor(options: Partial<AtlasCanvasOptions> = {}) {
        super(options)
        this.loadCloud = options.loadCloud
        this.loadWaveFrontMesh = options.loadWaveFrontMesh
    }

    get smoothness() {
        return this._smoothness
    }
    set smoothness(value: number) {
        if (value === this._smoothness) return

        this._smoothness = value
        this.refresh()
    }

    get highlight() {
        return this._highlight
    }
    set highlight(value: number) {
        if (value === this._highlight) return

        this._highlight = value
        this.refresh()
    }

    showMesh(id: string, options: Partial<AtlasMeshOptions> = {}) {
        const { meshes, context } = this
        const currentMesh = meshes.get(id) ?? {
            id,
            content: "",
            visible: true,
            status: AtlasMeshStatus.ToLoad,
            color: [1, 1, 1, 1],
        }
        const mesh: AtlasMesh = {
            ...currentMesh,
            ...options,
        }
        if (context && mesh.status === AtlasMeshStatus.ToLoad) {
            mesh.status = AtlasMeshStatus.Loading
            const { loadWaveFrontMesh } = this
            if (!loadWaveFrontMesh) {
                throw Error(`Missing loader "WaveFrontMesh"!
It seems that you forgot to give it to the constructor:
const painter = new AtlasPainter({
    loadWaveFrontMesh: (id: string): Promise<string> => ...
})`)
            }
            loadWaveFrontMesh(id)
                .then((content: string) => {
                    const painter = new MeshPainter(context, content)
                    mesh.paint = painter.paint
                    this.refresh()
                })
                .catch(ex => console.error(`Unable to load mesh "${id}"!`, ex))
        }
        meshes.set(id, mesh)
    }

    hideMesh(id: string) {
        const mesh = this.meshes.get(id)
        if (mesh) {
            mesh.visible = false
            this.refresh()
        }
    }

    hideAllMeshes() {
        this.meshes.forEach(mesh => (mesh.visible = false))
        this.refresh()
    }

    /**
     * @param id Identifier used to show/hide a given cloud.
     */
    showCloud(id: string, options: Partial<AtlasCloudOptions> = {}) {
        const { clouds, context } = this
        const oldCloud = clouds.get(id) ?? {
            id,
            visible: true,
            status: AtlasCloudStatus.ToLoad,
            color: [1, 1, 1, 1],
            radius: 10,
        }
        const newCloud: AtlasCloud = {
            ...oldCloud,
            ...options,
        }
        if (context && newCloud.status === AtlasCloudStatus.ToLoad) {
            newCloud.status = AtlasCloudStatus.Loading
            const { loadCloud } = this
            if (!loadCloud) {
                throw Error(`Missing loader "Cloud"!
It seems that you forgot to give it to the constructor:
const painter = new AtlasPainter({
    loadCloud: (id: string): Promise<Float32Array> => ...
})`)
            }
            loadCloud(id)
                .then((data: Float32Array) => {
                    const painter = new CloudPainter(context, data)
                    newCloud.painter = painter
                    if (newCloud.visible) context.add(painter)
                    newCloud.status = AtlasCloudStatus.Ready
                    this.refresh()
                })
                .catch(ex => console.error(`Unable to load cloud "${id}"!`, ex))
        }
        clouds.set(id, newCloud)
        if (
            context &&
            newCloud.painter &&
            newCloud.visible !== oldCloud.visible
        ) {
            if (newCloud.visible) {
                context.add(newCloud.painter)
            } else {
                context.remove(newCloud.painter)
            }
        }
    }

    protected init() {
        const { context } = this
        if (!context) return

        const clear = new TgdPainterClear(context, {
            color: [0, 0, 0.2, 1],
            depth: 1,
        })
        context.removeAll()
        context.add(clear)
        const { camera } = context
        camera.setTarget(6587.5015, 3849.2866, 5687.4893)
        camera.setOrientation(0, 0, 1, 0)
        camera.spaceHeightAtTarget = 13150
        this.framebufferFactory?.cleanUp()
        this.framebufferFactory = new Wgl2FactoryFrameBuffer(context.gl, {
            internalFormat: "RGBA",
            depthBuffer: true,
        })
        this.layerPainter = new LayerPainter(context)
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
