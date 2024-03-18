import {
    CodeBloc,
    Functions,
    Variables,
    funcs,
    stringifyCode,
    vars,
} from "./code"

export class TgdShaderVertex {
    public precision: "lowp" | "mediump" | "highp" = "mediump"
    public uniforms: Variables
    public attributes: Variables
    public varying: Variables
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
        uniforms: Variables
        attributes: Variables
        varying: Variables
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
