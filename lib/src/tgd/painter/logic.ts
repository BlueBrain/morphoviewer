import { TgdPainter } from "./painter"

/**
 * This painter paints nothing but execute some logic at every frame.
 */
export class TgdPainterLogic extends TgdPainter {
    constructor(
        private readonly logicFunction: (time: number, delay: number) => void
    ) {
        super()
    }

    delete(): void {}

    paint(time: number, delay: number): void {
        this.logicFunction(time, delay)
    }
}
