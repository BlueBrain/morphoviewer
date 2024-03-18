import { TgdDataset } from "@tgd/dataset"
import { parseGLB } from "./parser"
import {
    TgdFormatGltf,
    TgdFormatGltfAccessor,
    TgdFormatGltfMaterial,
    TgdFormatGltfMesh,
} from "@tgd/types/gltf"
import { TgdTexture2DOptions } from "@tgd/types"

export class TgdParserGLTransfertFormatBinary {
    public readonly gltf: Readonly<TgdFormatGltf>

    private readonly chunks: ArrayBuffer[]
    private readonly cacheImages = new Map<
        number,
        Promise<HTMLImageElement | undefined>
    >()
    private readonly cacheImageURLs = new Map<number, string>()
    private readonly cacheBufferViewDatas = new Map<number, ArrayBuffer>()

    constructor(content: ArrayBuffer) {
        try {
            const data = parseGLB(content)
            this.gltf = data.gltf
            this.chunks = data.chunks
        } catch (ex) {
            const message =
                ex instanceof Error ? ex.message : JSON.stringify(ex)
            throw Error(`[TgdParserGLTransfertFormatBinary] ${message}`)
        }
    }

    getAccessor(accessorIndex = 0): TgdFormatGltfAccessor {
        const accessor = this.gltf.accessors?.[accessorIndex]
        if (!accessor) {
            throw Error(`Asset has no accessor with index #${accessorIndex}!`)
        }

        return accessor
    }

    getMaterial(materialIndex: number): TgdFormatGltfMaterial {
        const material = this.gltf.materials?.[materialIndex]
        if (!material) {
            throw Error(`Asset has no material with index #${materialIndex}!`)
        }

        return material
    }

    getMesh(meshIndex = 0): TgdFormatGltfMesh {
        const mesh = this.gltf.meshes?.[meshIndex]
        if (!mesh) {
            throw Error(`Asset has no mesh with index #${meshIndex}!`)
        }

        return mesh
    }

    getMeshPrimitive(meshIndex = 0, primitiveIndex = 0) {
        const mesh = this.getMesh(meshIndex)
        const primitive = mesh.primitives[primitiveIndex]
        if (!primitive) {
            throw Error(
                `Asset has no primitive #${primitiveIndex} in mesh #${meshIndex}!`
            )
        }

        return primitive
    }

    getMeshPrimitiveIndices(
        meshIndex = 0,
        primitiveIndex = 0
    ): { elemType: number; elemData: ArrayBuffer; elemCount: number } {
        const primitive = this.getMeshPrimitive(meshIndex, primitiveIndex)
        const accessor = this.getAccessor(primitive.indices ?? 0)
        const buffer = this.getBufferViewData(accessor.bufferView ?? 0)
        return {
            elemType: accessor.componentType,
            elemData: buffer,
            elemCount: accessor.count,
        }
    }

    getTexture2DOptions(textureIndex: number): TgdTexture2DOptions {
        const texture = this.gltf.textures?.[textureIndex]
        if (!texture) {
            throw Error(`Asset has no texture with index #${textureIndex}!`)
        }

        const source =
            texture.source ?? texture.extensions?.EXT_texture_webp?.source ?? 0
        const url = this.getImageURL(source)
        const options: TgdTexture2DOptions = {
            image: url,
        }
        return options
    }

    async loadImage(imageIndex: number): Promise<HTMLImageElement | undefined> {
        const fromCache = this.cacheImages.get(imageIndex)
        if (fromCache) return fromCache

        const url = this.getImageURL(imageIndex)
        console.log("🚀 [gltf] url = ", url) // @FIXME: Remove this line written on 2024-03-09 at 14:53
        if (!url) return

        const promise = new Promise<HTMLImageElement | undefined>(
            (resolve, reject) => {
                const img = new Image()
                img.src = url
                img.onload = () => {
                    resolve(img)
                }
                img.onerror = () => {
                    console.error(
                        `Unable to load image #${imageIndex}!`,
                        this.gltf.images?.[imageIndex]
                    )
                    reject()
                }
            }
        )
        this.cacheImages.set(imageIndex, promise)
        return promise
    }

    getImageURL(imageIndex: number): string | undefined {
        const fromCache = this.cacheImageURLs.get(imageIndex)
        if (fromCache) return fromCache

        const { gltf } = this
        const image = gltf.images?.[imageIndex]
        if (!image) return

        if (image.uri) return image.uri

        if (typeof image.bufferView !== "number") return
        const buffer = this.getBufferViewData(image.bufferView)
        if (!buffer) return

        const blob = new Blob([buffer], {
            type: image.mimeType,
        })
        const url = URL.createObjectURL(blob)
        this.cacheImageURLs.set(imageIndex, url)
        return url
    }

    getBufferViewData(bufferViewIndex: number): ArrayBuffer {
        const fromCache = this.cacheBufferViewDatas.get(bufferViewIndex)
        if (fromCache) return fromCache

        const { gltf } = this
        const bufferView = gltf.bufferViews?.[bufferViewIndex]
        console.log(
            "🚀 [gltf] bufferViewIndex, bufferView = ",
            bufferViewIndex,
            bufferView
        ) // @FIXME: Remove this line written on 2024-03-09 at 14:57
        if (!bufferView)
            throw Error(`No bufferView with index #${bufferViewIndex}!`)

        const buffer = this.chunks[bufferView.buffer]
        const byteOffset = bufferView.byteOffset ?? 0
        const data = buffer.slice(
            byteOffset,
            byteOffset + bufferView.byteLength
        )
        this.cacheBufferViewDatas.set(bufferViewIndex, data)
        return data
    }

    setAttrib(
        dataset: TgdDataset,
        attribName: string,
        meshIndex: number,
        primitiveIndex = 0,
        primitiveAttribName?: string
    ) {
        const { gltf } = this
        const accessorIndex =
            gltf.meshes?.[meshIndex].primitives[primitiveIndex].attributes[
                primitiveAttribName ?? attribName
            ] ?? -1
        const accessor = gltf.accessors?.[accessorIndex]
        if (!accessor) {
            throw Error(
                `No attribute "${
                    primitiveAttribName ?? attribName
                }" for primitive #${primitiveIndex} of mesh #${meshIndex}!`
            )
        }

        const bufferViewIndex = accessor.bufferView ?? 0
        const bufferView = gltf.bufferViews?.[bufferViewIndex]
        if (!bufferView) {
            throw Error(`No bufferView with index #${bufferViewIndex}!`)
        }
        const buffer = this.getBufferViewData(bufferViewIndex)
        dataset.set(attribName, buffer, {
            byteStride: bufferView.byteStride,
            byteOffset: accessor.byteOffset,
            count: accessor.count,
        })
    }
}
