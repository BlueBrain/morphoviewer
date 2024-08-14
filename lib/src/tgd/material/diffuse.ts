import {
    TgdProgram,
    TgdTexture2D,
    WebglAttributeType,
    WebglUniformType,
} from "@tgd/types"
import { TgdVec3, TgdVec4 } from "@tgd/math"
import { TgdMaterial } from "./material"
import { CodeBloc } from "@tgd/shader/code"
import { TgdLight } from "@tgd/light"

export type TgdMaterialDiffuseOptions = Partial<{
    color: TgdVec4 | TgdTexture2D
    light: TgdLight
    ambient: TgdLight
}>

const DEFAULT_COLOR = new TgdVec4(0.8, 0.8, 0.8, 1)

export class TgdMaterialDiffuse extends TgdMaterial {
    public light = new TgdLight()
    public ambient = new TgdLight({ color: new TgdVec4(0.8, 0.8, 0.8, 0) })
    public color = new TgdVec4(DEFAULT_COLOR)

    public readonly varyings: { [name: string]: WebglAttributeType }
    public readonly uniforms: { [name: string]: WebglUniformType } = {
        uniLight: "vec3",
        uniLightDir: "vec3",
        uniAmbient: "vec3",
    }
    public readonly fragmentShaderCode: CodeBloc
    public readonly vertexShaderCode: CodeBloc

    private readonly texture: TgdTexture2D | null
    private readonly lightColor = new TgdVec3()
    private readonly ambientColor = new TgdVec3()

    constructor(options: TgdMaterialDiffuseOptions = {}) {
        super()
        const color = options.color ?? DEFAULT_COLOR
        if (options.light) {
            this.light = options.light
        }
        if (options.ambient) {
            this.ambient = options.ambient
        }
        const hasTexture = !(color instanceof TgdVec4)
        this.texture = hasTexture ? color : null
        this.fragmentShaderCode = [
            "vec3 n = normalize(varNormal);",
            `float light = -dot(n, uniLightDir);`,
            hasTexture
                ? `vec4 color = texture(texDiffuse, varUV);`
                : `vec4 color = uniColor;`,
            `float spec = max(0.0, reflect(uniLightDir, n).z);`,
            `spec = pow(spec, 20.0);`,
            `color = vec4(`,
            `  color.rgb * (`,
            `    mix(uniAmbient, uniLight, light)`,
            `  ) + vec3(spec),`,
            `  1.0`,
            `);`,
            `return color;`,
        ]
        this.vertexShaderCode = [
            "varNormal = mat3(uniModelViewMatrix) * NORMAL;",
        ]
        this.varyings = {
            varNormal: "vec3",
        }
        if (hasTexture) {
            this.vertexShaderCode.push("varUV = TEXCOORD_0;")
            this.varyings.varUV = "vec2"
            this.uniforms.texDiffuse = "sampler2D"
        } else {
            this.uniforms.uniColor = "vec4"
            this.color = color
        }
    }

    setUniforms(program: TgdProgram): void {
        program.uniform3fv("uniLightDir", this.light.direction)
        this.lightColor.from(this.light.color).scale(this.light.color.w)
        program.uniform3fv("uniLight", this.lightColor)
        this.ambientColor.from(this.ambient.color).scale(this.ambient.color.w)
        program.uniform3fv("uniAmbient", this.ambientColor)

        const { texture } = this
        if (texture) texture.activate(program, "texDiffuse")
        else program.uniform4fv("uniColor", this.color)
    }
}
