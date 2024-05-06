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
export class TgdShaderVertex {
    public precision: "lowp" | "mediump" | "highp" = "mediump"
    public uniforms: Variables<WebglUniformType>
    public attributes: Variables<WebglAttributeType>
    public varying: Variables<WebglAttributeType>
    public functions: Functions
    public mainCode: CodeBloc

    constructor({
        precision = "mediump",
        uniforms = {},
        attributes = {},
        varying = {},
        functions = {},
        mainCode = [],
    }: Partial<{
        precision: "lowp" | "mediump" | "highp"
        uniforms: Variables<WebglUniformType>
        attributes: Variables<WebglAttributeType>
        varying: Variables<WebglAttributeType>
        functions: Functions
        mainCode: CodeBloc
    }> = {}) {
        this.precision = precision
        this.uniforms = uniforms
        this.attributes = attributes
        this.varying = varying
        this.functions = functions
        this.mainCode = mainCode
    }

    get code() {
        return stringifyCode([
            `#version 300 es`,
            `precision ${this.precision} float;`,
            ...vars(this.uniforms, "uniform"),
            ...vars(this.attributes, "in"),
            ...vars(this.varying, "out"),
            ...funcs(this.functions),
            "",
            `void main() {`,
            this.mainCode,
            "}",
        ])
    }
}
