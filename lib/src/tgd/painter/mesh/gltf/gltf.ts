import { TgdGeometry } from "./../../../geometry/geometry"
import { TgdContext } from "@tgd/context"
import { TgdDataset } from "@tgd/dataset"
import { TgdParserGLTransfertFormatBinary } from "@tgd/parser"
import { TgdVec4 } from "@tgd/math"
import { TgdMaterialDiffuse } from "@tgd/material"

import { TgdPainterMesh } from "../mesh"

export interface TgdPainterMeshGltfOptions {
    asset: TgdParserGLTransfertFormatBinary
    meshIndex: number
    primitiveIndex?: number
}

/**
 */
export class TgdPainterMeshGltf extends TgdPainterMesh {
    constructor(context: TgdContext, options: TgdPainterMeshGltfOptions) {
        const { asset, meshIndex, primitiveIndex = 0 } = options
        const color = figureColor(asset, meshIndex, primitiveIndex, context)
        const material = new TgdMaterialDiffuse({
            color,
        })
        const dataset = new TgdDataset({
            POSITION: "vec3",
            NORMAL: "vec3",
            TEXCOORD_0: "vec2",
        })
        asset.setAttrib(dataset, "POSITION", meshIndex, primitiveIndex)
        asset.setAttrib(dataset, "NORMAL", meshIndex, primitiveIndex)
        asset.setAttrib(dataset, "TEXCOORD_0", meshIndex, primitiveIndex)
        const { elemType, elemData } = asset.getMeshPrimitiveIndices(
            meshIndex,
            primitiveIndex
        )
        super(context, {
            geometry: new TgdGeometry({
                dataset,
                elements: makeElementsArray(elemType, elemData),
                drawMode: "TRIANGLES",
            }),
            material,
        })
    }
}

const DEFAULT_COLOR = new TgdVec4(0.8, 0.8, 0.8, 1)

function figureColor(
    asset: TgdParserGLTransfertFormatBinary,
    meshIndex: number,
    primitiveIndex: number,
    context: TgdContext
) {
    const primitive = asset.getMeshPrimitive(meshIndex, primitiveIndex)
    const materialIndex = primitive.material ?? 0
    const pbr = asset.getMaterial(materialIndex).pbrMetallicRoughness
    if (!pbr) return DEFAULT_COLOR

    if (pbr.baseColorTexture) {
        const textureIndex =
            asset.getMaterial(materialIndex).pbrMetallicRoughness
                ?.baseColorTexture?.index
        console.log(
            "🚀 [gltf] materialIndex, asset.getMaterial(materialIndex) = ",
            materialIndex,
            asset.getMaterial(materialIndex)
        ) // @FIXME: Remove this line written on 2024-03-08 at 23:28
        const textureOptions = asset.getTexture2DOptions(textureIndex ?? 0)
        const color = context.textures2D.create(textureOptions)
        return color
    }
    if (pbr.baseColorFactor) {
        return new TgdVec4(...pbr.baseColorFactor)
    }
    return DEFAULT_COLOR
}

function makeElementsArray(
    elemType: number,
    elemData: ArrayBuffer
): Uint8Array | Uint16Array | Uint32Array {
    switch (elemType) {
        case WebGL2RenderingContext.UNSIGNED_BYTE:
            return new Uint8Array(elemData)
        case WebGL2RenderingContext.UNSIGNED_SHORT:
            return new Uint16Array(elemData)
        default:
            return new Uint32Array(elemData)
    }
}
