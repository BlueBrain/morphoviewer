import { TgdPainterSegmentsData } from "@tolokoban/tgd"
import { Segments } from "./segments"
import { CellNodes } from "./nodes"

export function makeData(nodes: CellNodes): TgdPainterSegmentsData {
    const segments = new Segments(nodes)
    nodes.forEach(({ index, parent }) => {
        if (parent < 0) return

        segments.addSegment(index, parent)
    })
    return segments.data
}
