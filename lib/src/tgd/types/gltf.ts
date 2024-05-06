// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.pdf

import { TypeDef, assertType } from "@tgd/types/guards"
import { ArrayNumber16, ArrayNumber3, ArrayNumber4 } from "./arrays"

export interface TgdFormatGltfAccessor {
    bufferView?: number
    byteOffset?: number
    componentType: number
    normalized?: boolean
    count: number
    type: string
    name?: string
}

export interface TgdFormatGltfMaterialPbrMetallicRoughness {
    /**
     * The factors for the base color of the material.
     *
     * Default to [1,1,1,1].
     */
    baseColorFactor?: [number, number, number, number]
    /**
     * The base color texture.
     */
    baseColorTexture?: TextureInfo
    /**
     * The factor for the metalness of the material.
     *
     * Default to 1.
     */
    metallicFactor?: number
    /**
     * The factor for the roughness of the material.
     *
     * Default to 1.
     */
    roughnessFactor?: number
    /**
     * The metallic-roughness texture.
     */
    metalicRoughnessTexture?: TextureInfo
}

interface TextureInfo {
    index: number
    /**
     * The set index of texture’s TEXCOORD attribute
     * used for texture coordinate mapping.
     *
     * Default to 0.
     */
    texCoord?: number
}

export interface TgdFormatGltfMaterial {
    name?: string
    pbrMetallicRoughness?: TgdFormatGltfMaterialPbrMetallicRoughness
    normalTexture?: {
        /** The index of the texture */
        index: number
        /**
         * The set index of texture’s TEXCOORD attribute
         * used for texture coordinate mapping.
         *
         * Default to 0.
         */
        texCoord?: number
        /**
         * The scalar parameter applied to each normal
         * vector of the normal texture.
         *
         * Default to 1.
         */
        scale?: number
    }
    occlusionTexture?: {
        /** The index of the texture */
        index: number
        /**
         * The set index of texture’s TEXCOORD attribute
         * used for texture coordinate mapping.
         *
         * Default to 0.
         */
        texCoord?: number
        /**
         * A scalar multiplier controlling the amount
         * of occlusion applied.
         *
         * Default to 1.
         */
        stength?: number
    }
    emissiveTexture?: TextureInfo
    alphaMode?: "OPAQUE" | "MASK" | "BLEND"
    /** Default to 0.5 */
    alphaCutoff?: number
    doubleSided?: boolean
}

export interface TgdFormatGltfMesh {
    name: string
    primitives: Array<{
        attributes: Record<string, number>
        indices?: number
        mode?: number
        material?: number
    }>
}

export interface TgdFormatGltfScene {
    name?: string
    nodes?: number[]
}

export interface TgdFormatGltfNode {
    /** Index of the camera referenced by this node. */
    camera?: number
    /**
     * Indices of the children nodes.
     */
    children?: number[]
    /** Index of the skin referenced by this node. */
    skin?: number
    /** 4x4 transformation matrix. */
    matrix?: ArrayNumber16
    /** Index of the mesh referenced by this node. */
    mesh?: number
    /** Quaternion (x, y, z, w) of the current orientation. */
    rotation?: ArrayNumber4
    scale?: ArrayNumber3
    translation?: ArrayNumber3
    /**
     * The weights of the instantiated morph target.
     * The number of array elements MUST match the
     * number of morph targets of the referenced mesh.
     * When defined, mesh MUST also be defined.
     */
    weights?: number[]
    name?: string
}

export type TgdFormatGltfCamera =
    | {
          type: "perspective"
          name?: string
          perspective: {
              aspectRatio?: number
              /**
               * The floating-point vertical field of view in radians.
               * This value SHOULD be less than π. */
              yfov: number
              zfar?: number
              znear: number
          }
      }
    | {
          type: "orthographic"
          name?: string
          orthographic: {
              /** The floating-point horizontal magnification of the view. */
              xmag: number
              /** The floating-point vertical magnification of the view. */
              ymag: number
              zfar: number
              znear: number
          }
      }

/**
 * @see https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
 */
export interface TgdFormatGltf {
    accessors?: TgdFormatGltfAccessor[]
    bufferViews?: Array<{
        buffer: number
        byteLength: number
        byteOffset?: number
        byteStride?: number
        target?: number
    }>
    cameras?: TgdFormatGltfCamera[]
    images?: Array<
        Partial<{
            bufferView: number
            mimeType: string
            name: string
            uri: string
        }>
    >
    materials?: TgdFormatGltfMaterial[]
    meshes?: TgdFormatGltfMesh[]
    nodes?: TgdFormatGltfNode[]
    samplers?: Array<
        Partial<{
            minFilter: number
            magFilter: number
            wrapS: number
            wrapT: number
            name: string
        }>
    >
    scenes?: TgdFormatGltfScene[]
    textures?: Array<{
        sampler?: number
        source?: number
        name?: string
        extensions?: {
            EXT_texture_webp?: {
                source: number
            }
        }
    }>
}

export function assertTgdFormatGltf(
    data: unknown
): asserts data is TgdFormatGltf {
    assertType(data, [
        "partial",
        {
            accessors: [
                "array",
                {
                    bufferView: ["?", "number"],
                    byteOffset: ["?", "number"],
                    componentType: "number",
                    normalized: ["?", "boolean"],
                    count: "number",
                    type: "string",
                    name: ["?", "string"],
                },
            ],
            meshes: [
                "array",
                {
                    name: "string",
                    primitives: [
                        "array",
                        {
                            attributes: ["map", "number"],
                            indices: ["?", "number"],
                            mode: ["?", "number"],
                            material: ["?", "number"],
                        },
                    ],
                },
            ],
            images: [
                "array",
                [
                    "partial",
                    {
                        bufferView: "number",
                        mimeType: "string",
                        name: "string",
                        uri: "string",
                    },
                ],
            ],
            bufferViews: [
                "array",
                {
                    buffer: "number",
                    byteLength: "number",
                    byteOffset: ["?", "number"],
                    byteStride: ["?", "number"],
                    target: ["?", "number"],
                },
            ],
            materials: ["array", typeMaterial],
            samplers: [
                "array",
                [
                    "partial",
                    {
                        minFilter: "number",
                        magFilter: "number",
                        wrapS: "number",
                        wrapT: "number",
                        name: "string",
                    },
                ],
            ],
            textures: [
                "array",
                [
                    "partial",
                    {
                        sampler: "number",
                        source: "number",
                        name: "string",
                    },
                ],
            ],
        },
    ])
}

const typeTextureInfo: TypeDef = {
    index: "number",
    texCoord: ["?", "number"],
}

const typePbrMetallicRoughness: TypeDef = [
    "partial",
    {
        baseColorFactor: ["array(4)", "number"],
        baseColorTexture: typeTextureInfo,
        metallicFactor: "number",
        roughnessFactor: "number",
        metalicRoughnessTexture: typeTextureInfo,
    },
]

const typeMaterial: TypeDef = [
    "partial",
    {
        name: "string",
        pbrMetallicRoughness: typePbrMetallicRoughness,
        normalTexture: {
            ...typeTextureInfo,
            scale: ["?", "number"],
        },
        occlusionTexture: {
            ...typeTextureInfo,
            strength: ["?", "number"],
        },
        emissiveTexture: typeTextureInfo,
        alphaMode: ["literal", "OPAQUE", "MASK", "BLEND"],
        alphaCutoff: "number",
        doubleSided: "boolean",
    },
]
