import {
    TgdCamera,
    TgdContext,
    TgdPainterClear,
    TgdPainterDepth,
    TgdPainterSegments,
    TgdPainterSegmentsData,
} from "@tgd"
import { TipsPainter } from "./painter/tips"

export class GizmoPainter {
    private painter: TipsPainter | null = null
    private context: TgdContext | null = null

    updateOrientationFrom(camera: TgdCamera) {
        const { painter } = this
        if (!painter) return

        painter.updateOrientationFrom(camera)
    }

    set canvas(canvas: HTMLCanvasElement | null) {
        if (this.context) {
            this.context.destroy()
            this.context = null
            this.painter = null
        }
        if (!canvas) return

        const context = new TgdContext(canvas, {
            alpha: true,
            depth: true,
            antialias: true,
        })
        this.context = context
        const painter = new TipsPainter(context)
        this.painter = painter
        context.add(
            new TgdPainterClear(context, {
                color: [0, 0, 0, 0],
                depth: 1,
            }),
            new TgdPainterDepth(context, { enabled: true }),
            makeAxis(context),
            painter
        )
        context.paint()
    }
}

function makeAxis(context: TgdContext) {
    const data = new TgdPainterSegmentsData()
    const A = 0.05
    const B = 0
    const E = 1e-1
    data.add([E, 0, 0, A], [1, 0, 0, B], [0, 0], [0, 0])
    data.add([0, E, 0, A], [0, 1, 0, B], [0.5, 0], [0.5, 0])
    data.add([0, 0, E, A], [0, 0, 1, B], [1, 0], [1, 0])
    const segments = new TgdPainterSegments(context, data)
    segments.colorTexture.makePalette(["#a00", "#0a0", "#00a"])
    segments.shiftZ = 0.1
    return segments
}
