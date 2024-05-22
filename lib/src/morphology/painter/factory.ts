import { TgdPainterSegmentsData } from "@tgd"
import { Segments } from "./segments"
import { CellNodes } from "./nodes"
import { CellNodeType } from "@/types"

export function makeData(nodes: CellNodes): TgdPainterSegmentsData {
    const segments = new Segments(nodes)
    nodes.forEach(
        ({ index: childIndex, parent: parentIndex, type: childType }) => {
            if (parentIndex < 0) return

            const parent = nodes.getByIndex(parentIndex)
            if (!parent) return

            const parentType = parent.type
            if (
                parentType === CellNodeType.Soma &&
                childType !== CellNodeType.Soma
            )
                return

            segments.addSegment(childIndex, parentIndex)
        }
    )
    return segments.data
}
