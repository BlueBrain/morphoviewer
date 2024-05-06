import { TgdProgram } from ".."
import { TgdFilter } from "./filter"

export class TgdFilterHueRotation extends TgdFilter {
    private hueShift = 0

    constructor() {
        super({
            fragmentShaderCode: [
                "vec4 color = texture(texSource, varUV);",
                "vec3 rgb = color.rgb;",
                "const vec3 k = vec3(0.5773502691896258);",
                "float cosAngle = cos(uniHueShift);",
                "FragColor = vec4(",
                [
                    "rgb * cosAngle ",
                    "+ cross(k, rgb) * sin(uniHueShift) ",
                    "+ k * dot(k, rgb) * (1.0 - cosAngle),",
                    "color.a",
                ],
                ");",
            ],
            uniforms: {
                uniHueShift: "float",
            },
        })
    }

    get hueShiftInRadians() {
        return this.hueShift
    }
    set hueShiftInRadians(v: number) {
        this.hueShift = v
    }

    get hueShiftInDegrees() {
        return (this.hueShift * 180) / Math.PI
    }
    set hueShiftInDegrees(v: number) {
        this.hueShift = (v * Math.PI) / 180
    }

    public readonly setUniforms = (
        program: TgdProgram,
        _time: number
    ): void => {
        program.uniform1f("uniHueShift", this.hueShift)
    }
}
