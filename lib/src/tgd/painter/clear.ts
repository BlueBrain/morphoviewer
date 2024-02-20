import { TgdPainter } from "."
import { TgdContext } from "@tgd/context"
import { TgdContextInterface, TgdVec4 } from ".."

export interface TgdPainterClearOptions {
    color: [red: number, green: number, blue: number, alpha: number] | TgdVec4
    depth: number
}

/**
 * @see {@link TgdPainterClearOptions}
 */
export class TgdPainterClear implements TgdPainter {
    private clearMask = 0

    public red = 1
    public green = 0.7
    public blue = 0
    public alpha = 1
    public depth = 1

    constructor(
        public readonly context: TgdContextInterface,
        options: Partial<TgdPainterClearOptions> = {}
    ) {
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
        ;[this.red, this.green, this.blue, this.alpha] = color
        this.depth = depth
    }

    /** Nothing to destroy. */
    delete(): void {}

    paint(_time: number, _delay: number): void {
        const { clearMask, context, red, green, blue, alpha, depth } = this
        const { gl } = context
        gl.clearColor(red, green, blue, alpha)
        gl.clearDepth(depth)
        gl.clear(clearMask)
    }

    update(_time: number, _delay: number): void {}
}
