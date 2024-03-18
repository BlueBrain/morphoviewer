import { TgdContext } from "@tgd/context"
import { TgdGeometry } from "@tgd/geometry"
import { TgdMaterial } from "@tgd/material"
import { TgdMat4, TgdVec3 } from "@tgd/math"
import { TgdProgram } from "@tgd/types"
import { TgdVertexArray } from "@tgd/vao"
import { TgdPainter } from "../../painter"

import { TgdShaderFragment } from "@tgd/shader/fragment"
import { TgdShaderVertex } from "@tgd/shader/vertex"

export interface TgdPainterMeshOptions {
    geometry: TgdGeometry
    material: TgdMaterial
}

/**
 */
export class TgdPainterMesh extends TgdPainter {
    public matrixTransfo = new TgdMat4()

    private readonly prg: TgdProgram
    private readonly vao: TgdVertexArray
    private readonly elementsType: number
    private readonly count: number
    private readonly material: TgdMaterial
    private readonly geometry: TgdGeometry
    private readonly drawMode: number = 0
    private bboxMin: TgdVec3 | null = null
    private bboxMax: TgdVec3 | null = null

    constructor(
        private readonly context: TgdContext,
        options: TgdPainterMeshOptions
    ) {
        super()
        const { material, geometry } = options
        this.geometry = geometry
        this.material = material
        this.drawMode =
            typeof geometry.drawMode === "number"
                ? geometry.drawMode
                : context.gl[geometry.drawMode]
        const vert = new TgdShaderVertex({
            uniforms: {
                uniTransfoMatrix: "mat4",
                uniModelViewMatrix: "mat4",
                uniProjectionMatrix: "mat4",
                ...material.uniforms,
            },
            attributes: {
                [geometry.attPosition]: "vec4",
                [geometry.attNormal]: "vec3",
                [geometry.attUV]: "vec2",
            },
            varying: material.varyings,
            functions: {
                "void applyMaterial()": material.vertexShaderCode,
            },
            mainCode: [
                "gl_Position = uniProjectionMatrix * uniModelViewMatrix * uniTransfoMatrix * POSITION;",
                "applyMaterial();",
            ],
        }).code
        const frag = new TgdShaderFragment({
            uniforms: material.uniforms,
            outputs: { FragColor: "vec4" },
            varying: material.varyings,
            functions: {
                "vec4 applyMaterial()": material.fragmentShaderCode,
            },
            mainCode: [`FragColor = applyMaterial();`],
        }).code
        console.log("🚀 [gltf] vert = ", vert) // @FIXME: Remove this line written on 2024-03-08 at 22:04
        console.log("🚀 [gltf] frag = ", frag) // @FIXME: Remove this line written on 2024-03-08 at 22:04
        const prg = context.programs.create({
            vert,
            frag,
        })
        this.prg = prg
        this.vao = context.createVAO(prg, [geometry.dataset], geometry.elements)
        this.elementsType = getElementType(geometry.elements)
        this.count = geometry.elements
            ? geometry.elements.length
            : geometry.dataset.count
    }

    computeBoundingBox(): {
        min: Readonly<TgdVec3>
        max: Readonly<TgdVec3>
    } {
        if (this.bboxMin && this.bboxMax) {
            return {
                min: this.bboxMin,
                max: this.bboxMax,
            }
        }

        const { dataset } = this.geometry
        const { get } = dataset.getAttribAccessor("POSITION")
        const min = new TgdVec3(get(0, 0), get(0, 1), get(0, 2))
        const max = new TgdVec3(min)
        for (let index = 1; index < dataset.count; index++) {
            const x = get(index, 0)
            const y = get(index, 1)
            const z = get(index, 2)
            min.x = Math.min(min.x, x)
            max.x = Math.max(max.x, x)
            min.y = Math.min(min.y, y)
            max.y = Math.max(max.y, y)
            min.z = Math.min(min.z, z)
            max.z = Math.max(max.z, z)
        }
        this.bboxMin = min
        this.bboxMax = max
        return { min, max }
    }

    public readonly paint = () => {
        const {
            context,
            prg,
            geometry,
            material,
            drawMode,
            count,
            matrixTransfo,
        } = this
        const { gl, camera } = context
        gl.enable(gl.CULL_FACE)
        gl.cullFace(gl.BACK)
        prg.use()
        material.setUniforms(prg)
        prg.uniformMatrix4fv("uniTransfoMatrix", matrixTransfo)
        prg.uniformMatrix4fv("uniModelViewMatrix", camera.matrixModelView)
        prg.uniformMatrix4fv("uniProjectionMatrix", camera.matrixProjection)
        this.vao.bind()
        if (geometry.elements) {
            gl.drawElements(drawMode, count, this.elementsType, 0)
        } else {
            gl.drawArrays(drawMode, 0, count)
        }
        this.vao.unbind()
    }

    delete(): void {
        this.vao.delete()
    }
}

function getElementType(
    elements: Uint8Array | Uint16Array | Uint32Array | undefined
): number {
    if (!elements) return 0

    if (elements instanceof Uint8Array)
        return WebGL2RenderingContext.UNSIGNED_BYTE
    if (elements instanceof Uint16Array)
        return WebGL2RenderingContext.UNSIGNED_SHORT
    return WebGL2RenderingContext.UNSIGNED_INT
}
