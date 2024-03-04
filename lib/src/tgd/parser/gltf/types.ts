import { assertType } from "@/tgd/types/guards"

export interface Gltf {
    meshes: Array<{
        name: string
        primitives: Array<
            [
                {
                    attributes: Record<string, number>
                    indices: number
                }
            ]
        >
    }>
}

export function assertGltf(data: unknown): asserts data is Gltf {
    assertType(data, {
        meshes: [
            "array",
            {
                name: "string",
                primitives: [
                    "array",
                    {
                        attributes: ["map", "number"],
                        indices: "number",
                    },
                ],
            },
        ],
    })
}
