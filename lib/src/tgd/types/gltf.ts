// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.pdf

import { TypeDef, assertType } from "@tgd/types/guards"

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

export interface TgdFormatGltf {
    accessors?: TgdFormatGltfAccessor[]
    bufferViews?: Array<{
        buffer: number
        byteLength: number
        byteOffset?: number
        byteStride?: number
        target?: number
    }>
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
    samplers?: Array<
        Partial<{
            minFilter: number
            magFilter: number
            wrapS: number
            wrapT: number
            name: string
        }>
    >
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
