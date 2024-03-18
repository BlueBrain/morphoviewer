import {
    CodeBloc,
    Functions,
    Variables,
    funcs,
    stringifyCode,
    vars,
} from "./code"

export class TgdShaderFragment {
    public precision: "lowp" | "mediump" | "highp" = "mediump"
    public uniforms: Variables
    public varying: Variables
    public outputs: Variables
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
        uniforms: Variables
        outputs: Variables
        varying: Variables
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
