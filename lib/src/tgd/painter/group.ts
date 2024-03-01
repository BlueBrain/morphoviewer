import { TgdPainterFunction } from "@tgd/types/painter"
import { TgdPainter } from "./painter"

export type TgdPainterGroupOptions = {
    onEnter?(time: number, delay: number): void
    onExit?(time: number, delay: number): void
}

/**
 * Group several painters together.
 */
export class TgdPainterGroup extends TgdPainter {
    public active = true
    public onEnter: TgdPainterFunction | undefined
    public onExit: TgdPainterFunction | undefined
    private readonly painters: TgdPainter[]

    constructor(
        painters: TgdPainter[] = [],
        { onEnter, onExit }: TgdPainterGroupOptions = {}
    ) {
        super()
        this.onEnter = onEnter
        this.onExit = onExit
        this.painters = [...painters]
    }

    forEachChild(callback: (child: TgdPainter, index: number) => void) {
        this.painters.forEach((child, index) => callback(child, index))
    }

    has(painter: TgdPainter): boolean {
        return this.painters.includes(painter)
    }

    add(...painters: TgdPainter[]) {
        for (const painter of painters) {
            this.painters.push(painter)
        }
    }

    remove(...painters: TgdPainter[]) {
        for (const painter of painters) {
            const index = this.painters.indexOf(painter)
            if (index < 0) continue

            this.painters.splice(index, 1)
            painter.delete()
        }
    }

    removeAll() {
        for (const painter of this.painters) {
            painter.delete()
        }
        this.painters.splice(0, this.painters.length)
    }

    delete(): void {
        for (const painter of this.painters) {
            painter.delete()
        }
        this.painters.splice(0, this.painters.length)
    }

    paint(time: number, delay: number): void {
        if (!this.active) return

        this.onEnter?.(time, delay)
        for (const painter of this.painters) {
            if (painter.active) painter.paint(time, delay)
        }
        this.onExit?.(time, delay)
    }
}
