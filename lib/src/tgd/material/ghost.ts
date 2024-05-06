import { TgdProgram, WebglAttributeType } from "@tgd/types"
import { TgdVec4 } from "@tgd/math"
import { TgdMaterial } from "./material"
import { CodeBloc } from "@tgd/shader/code"

export type TgdMaterialGhostOptions = Partial<{
    color: TgdVec4
    exponent: number
    intensity: number
}>

const DEFAULT_COLOR = new TgdVec4(0.6, 1, 0.9, 1)

export class TgdMaterialGhost extends TgdMaterial {
    public readonly varyings: { [name: string]: WebglAttributeType }
    public readonly fragmentShaderCode: CodeBloc
    public readonly vertexShaderCode: CodeBloc

    constructor({
        color = DEFAULT_COLOR,
        exponent = 3,
        intensity = 3,
    }: TgdMaterialGhostOptions = {}) {
        super()
        this.fragmentShaderCode = [
            `float light = 1.0 - varNormal.z;`,
            `light = pow(light, ${exponent.toFixed(6)});`,
            `vec4 color = vec4(${color.join(", ")});`,
            `return vec4(color.rgb * ${intensity.toFixed(
                6
            )}, color.a) * light;`,
        ]
        this.vertexShaderCode = [
            "varNormal = mat3(uniModelViewMatrix) * NORMAL;",
        ]
        this.varyings = {
            varNormal: "vec3",
        }
    }

    setUniforms(_program: TgdProgram): void {}
}
