import { TgdProgram, TgdTexture2D } from "@tgd/types"
import { TgdVec4 } from "@tgd/math"
import { TgdMaterial } from "./material"
import { CodeBloc } from "@tgd/shader/code"

export type TgdMaterialDiffuseOptions = Partial<{
    color: TgdVec4 | TgdTexture2D
}>

const DEFAULT_COLOR = new TgdVec4(0.8, 0.8, 0.8, 1)

export class TgdMaterialDiffuse extends TgdMaterial {
    public frontLightIntensity = 2

    public readonly varyings: { [name: string]: string }
    public readonly uniforms: { [name: string]: string } = {
        uniIntensity: "float",
    }
    public readonly fragmentShaderCode: CodeBloc
    public readonly vertexShaderCode: CodeBloc

    private readonly texture: TgdTexture2D | null

    constructor(options: TgdMaterialDiffuseOptions = {}) {
        super()
        const color = options.color ?? DEFAULT_COLOR
        if (color instanceof TgdVec4) {
            this.texture = null
            this.fragmentShaderCode = [
                `float light = varNormal.z * uniIntensity;`,
                `vec4 color = vec4(${color.join(", ")});`,
                `color = vec4(color.rgb * light, 1.0);`,
                `return color;`,
            ]
            this.vertexShaderCode = [
                "varNormal = mat3(uniModelViewMatrix) * NORMAL;",
            ]
            this.varyings = {
                varNormal: "vec3",
            }
        } else {
            this.texture = color
            this.fragmentShaderCode = [
                `float light = varNormal.z * uniIntensity;`,
                `vec4 color = texture(texDiffuse, varUV);`,
                `color = vec4(color.rgb * light, 1.0);`,
                `return color;`,
            ]
            this.vertexShaderCode = [
                "varUV = TEXCOORD_0;",
                "varNormal = mat3(uniModelViewMatrix) * NORMAL;",
            ]
            this.varyings = {
                varNormal: "vec3",
                varUV: "vec2",
            }
            this.uniforms = {
                ...this.uniforms,
                texDiffuse: "sampler2D",
            }
        }
    }

    setUniforms(program: TgdProgram): void {
        program.uniform1f("uniIntensity", this.frontLightIntensity)

        const { texture } = this
        if (texture) texture.activate(program, "texDiffuse")
    }
}
