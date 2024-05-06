import { TgdGeometry } from "@tgd/geometry"
import { TgdContext } from "@tgd/context"
import { TgdDataset } from "@tgd/dataset"
import { TgdParserGLTransfertFormatBinary } from "@tgd/parser"
import { TgdVec3, TgdVec4 } from "@tgd/math"
import { TgdMaterialDiffuse } from "@tgd/material"

import { TgdPainterMesh } from "../mesh"
import { TgdLight } from "@/tgd/light"

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
            light: new TgdLight({
                color: new TgdVec4(1, 1, 1, 1),
                direction: new TgdVec3(1, 0, 0),
            }),
        })
        if (color instanceof TgdVec4) {
            const dataset = new TgdDataset({
                POSITION: "vec3",
                NORMAL: "vec3",
            })
            asset.setAttrib(dataset, "POSITION", meshIndex, primitiveIndex)
            try {
                asset.setAttrib(dataset, "NORMAL", meshIndex, primitiveIndex)
            } catch (ex) {
                // It seems to be impossible to retrieve normals.
                // We will compute them with a smooth shading.
                console.warn("No normals found! We will apply smooth shading.")
            }
            super(context, {
                geometry: new TgdGeometry({
                    dataset,
                    elements: asset.getMeshPrimitiveIndices(
                        meshIndex,
                        primitiveIndex
                    ),
                    drawMode: "TRIANGLES",
                    computeNormalsIfMissing: true,
                }),
                material,
            })
        } else {
            const dataset = new TgdDataset({
                POSITION: "vec3",
                NORMAL: "vec3",
                TEXCOORD_0: "vec2",
            })
            asset.setAttrib(dataset, "POSITION", meshIndex, primitiveIndex)
            try {
                asset.setAttrib(dataset, "NORMAL", meshIndex, primitiveIndex)
            } catch (ex) {
                // It seems to be impossible to retrieve normals.
                // We will compute them with a smooth shading.
                console.warn("No normals found! We will apply smooth shading.")
            }
            asset.setAttrib(dataset, "TEXCOORD_0", meshIndex, primitiveIndex)
            super(context, {
                geometry: new TgdGeometry({
                    dataset,
                    elements: asset.getMeshPrimitiveIndices(
                        meshIndex,
                        primitiveIndex
                    ),
                    drawMode: "TRIANGLES",
                    computeNormalsIfMissing: true,
                }),
                material,
            })
        }
    }
}

const DEFAULT_COLOR = new TgdVec4(0.9, 0.7, 0.3, 1)

function figureColor(
    asset: TgdParserGLTransfertFormatBinary,
    meshIndex: number,
    primitiveIndex: number,
    context: TgdContext
) {
    const primitive = asset.getMeshPrimitive(meshIndex, primitiveIndex)
    const materialIndex = primitive.material ?? -1
    if (materialIndex === -1) return DEFAULT_COLOR

    const pbr = asset.getMaterial(materialIndex).pbrMetallicRoughness
    if (!pbr) return DEFAULT_COLOR

    if (pbr.baseColorTexture) {
        const textureIndex =
            asset.getMaterial(materialIndex).pbrMetallicRoughness
                ?.baseColorTexture?.index
        const textureOptions = asset.getTexture2DOptions(textureIndex ?? 0)
        const color = context.textures2D.create(textureOptions)
        return color
    }
    if (pbr.baseColorFactor) {
        return new TgdVec4(...pbr.baseColorFactor)
    }
    return DEFAULT_COLOR
}
