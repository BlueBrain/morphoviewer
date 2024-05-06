import { TgdVec2 } from "../math"
import { TgdFilter } from "./filter"

export interface TgdFilterBlurOptions {
    size: number
    direction: Readonly<TgdVec2>
}

const DEFAULT_DIRECTION: Readonly<TgdVec2> = new TgdVec2(1, 0)

export class TgdFilterBlur extends TgdFilter {
    constructor(options: Partial<TgdFilterBlurOptions> = {}) {
        const { size = 4, direction = DEFAULT_DIRECTION } = options
        const len = direction.size
        const invLen = len > 0 ? 1 / len : 1
        const sx = direction.x * invLen
        const sy = direction.y * invLen
        const lines: string[] = ["vec2 s;", "float f;"]
        let total = 0
        for (let s = 0; s < size - 1; s += 2) {
            const weight = size - s
            total += weight
            lines.push(
                `s = ${s + 1.4} * dir;`,
                `f = ${weight.toFixed(1)};`,
                `color += f * texture(texSource, varUV + s);`,
                `color += f * texture(texSource, varUV - s);`
            )
        }
        if (size & 1) {
            // Size is odd (not even).
            lines.push(
                `s = ${size} * dir;`,
                `color += texture(texSource, varUV + s);`,
                `color += texture(texSource, varUV - s);`
            )
            total++
        }
        total = total + total + size + 1
        super({
            fragmentShaderCode: [
                "vec2 dir = vec2(",
                [
                    `uniInverseWidth * ${sx.toFixed(9)},`,
                    `uniInverseHeight * ${sy.toFixed(9)}`,
                ],
                ");",
                `vec4 color = ${(size + 1).toFixed(
                    1
                )} * texture(texSource, varUV);`,
                ...lines,
                `FragColor = color * ${(1 / total).toFixed(9)};`,
            ],
            uniforms: {
                uniHueShift: "float",
            },
        })
    }
}
