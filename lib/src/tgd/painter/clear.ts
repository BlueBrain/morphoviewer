import { TgdVec4 } from "@tgd/math"
import { TgdPainter } from "./painter"
import { TgdContextInterface } from "@tgd/types"

export interface TgdPainterClearOptions {
    color: [red: number, green: number, blue: number, alpha: number] | TgdVec4
    depth: number
}

/**
 * @see {@link TgdPainterClearOptions}
 */
export class TgdPainterClear extends TgdPainter {
    private readonly clearMask

    public red = 1
    public green = 0.7
    public blue = 0
    public alpha = 1
    public depth = 1

    constructor(
        public readonly context: TgdContextInterface,
        private readonly options: Partial<TgdPainterClearOptions> = {}
    ) {
        super()
        const { gl } = context
        const color = options.color ?? [0, 0, 0, 1]
        const depth = options.depth ?? 1
        this.clearMask = 0
        let hasAnyOption = false
        if (options.color) {
            this.clearMask |= gl.COLOR_BUFFER_BIT
            hasAnyOption = true
        }
        if (typeof options.depth === "number") {
            this.clearMask |= gl.DEPTH_BUFFER_BIT
            hasAnyOption = true
        }
        if (!hasAnyOption) {
            throw Error(
                "[TgdPainterClear] You must give at least a color or a depth in the constructor!"
            )
        }
        // eslint-disable-next-line no-extra-semi
        ;[this.red, this.green, this.blue, this.alpha] = color
        this.depth = depth
    }

    /** Nothing to destroy. */
    delete(): void {}

    paint(): void {
        const { clearMask, context, red, green, blue, alpha, depth, options } =
            this
        const { gl } = context
        if (options.color) gl.clearColor(red, green, blue, alpha)
        if (typeof options.depth === "number") gl.clearDepth(depth)
        gl.clear(clearMask)
    }
}
