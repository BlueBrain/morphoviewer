import { WebglAttributeType, WebglUniformType } from ".."
import {
    CodeBloc,
    Functions,
    Variables,
    funcs,
    stringifyCode,
    vars,
} from "./code"

/**
 * @see https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf
 */
export class TgdShaderFragment {
    public precision: "lowp" | "mediump" | "highp" = "mediump"
    public uniforms: Variables<WebglUniformType>
    public varying: Variables<WebglAttributeType>
    public outputs: Variables<WebglAttributeType>
    public functions: Functions
    public mainCode: CodeBloc

    constructor({
        precision = "mediump",
        uniforms = {},
        outputs = {
            FragColor: "vec4",
        },
        varying = {},
        functions = {},
        mainCode = ["FragColor = vec4(1, 0.667, 0, 1);"],
    }: Partial<{
        precision: "lowp" | "mediump" | "highp"
        uniforms: Variables<WebglUniformType>
        outputs: Variables<WebglAttributeType>
        varying: Variables<WebglAttributeType>
        functions: Functions
        mainCode: CodeBloc
    }> = {}) {
        this.precision = precision
        this.uniforms = uniforms
        this.outputs = outputs
        this.varying = varying
        this.functions = functions
        this.mainCode = mainCode
    }

    get code() {
        return stringifyCode([
            `#version 300 es`,
            `precision ${this.precision} float;`,
            ...vars(this.uniforms, "uniform"),
            ...vars(this.varying, "in"),
            ...vars(this.outputs, "out"),
            ...funcs(this.functions),
            "",
            `void main() {`,
            this.mainCode,
            "}",
        ])
    }
}
