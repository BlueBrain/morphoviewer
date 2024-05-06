import { CodeBloc } from "@tgd/shader/code"
import { TgdProgram, WebglAttributeType, WebglUniformType } from ".."

export abstract class TgdMaterial {
    /**
     * Example:
     * ```
     * {
     *   varNormal: "vec3",
     *   varUV: "vec2"
     * }
     * ```
     */
    public readonly varyings: { [name: string]: WebglAttributeType } = {}

    public readonly uniforms: { [name: string]: WebglUniformType } = {}

    /**
     * The code of a `vec4 applyMaterial()` function.
     */
    abstract readonly fragmentShaderCode: CodeBloc

    /**
     * The code of a `void applyMaterial()` function.
     */
    abstract readonly vertexShaderCode: CodeBloc

    abstract setUniforms(program: TgdProgram): void
}
