import { CodeBloc } from "@tgd/shader/code"
import { TgdProgram, WebglUniformType } from "@tgd/types"

/**
 * Define the shader to be used in a filter.
 *
 * A filter is mostly a fragment shader working on a texture.
 *
 * Always available varyings:
 *  * `vec2 varUV`
 *
 * Always available uniforms:
 *  * `sampler2D texSource`: input texture.
 *  * `float uniWidth`: width of the texture in pixels.
 *  * `float uniHeight`: height of the texture in pixels.
 */
export class TgdFilter {
    /**
     * If you need more uniforms, define them here.
     * And set the values in the `setUniforms()` method.
     */
    public readonly uniforms: { [name: string]: WebglUniformType } = {}

    /**
     * The code of a `vec4 applyColor()` function.
     * Must return a `vec4` color.
     */
    public readonly fragmentShaderCode: CodeBloc = [
        "vec4 color = texture(texSource, varUV);",
        "return color;",
    ]

    public readonly setUniforms = (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        program: TgdProgram,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        time: number
    ): void => {}

    constructor(options: Partial<TgdFilterOptions> = {}) {
        const { uniforms, fragmentShaderCode, setUniforms } = options
        if (uniforms) this.uniforms = uniforms
        if (fragmentShaderCode) this.fragmentShaderCode = fragmentShaderCode
        if (setUniforms) this.setUniforms = setUniforms
    }
}

export interface TgdFilterOptions {
    uniforms: { [name: string]: WebglUniformType }
    fragmentShaderCode: CodeBloc
    setUniforms(program: TgdProgram, time: number): void
}
