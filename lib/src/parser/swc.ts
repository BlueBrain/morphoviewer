import { forEachLine } from "./for-each-line"

export enum CellNodeType {
    Soma = 1,
    Axon = 2,
    BasalDendrite = 3,
    ApicalDendrite = 4,
    Unknown = 666,
}

export interface CellNode {
    index: number
    parent: number
    type: CellNodeType
    x: number
    y: number
    z: number
    radius: number
    // Used to set the distance to the soma, normalized between 0 and 1.
    u: number
    // Type of segment (soma, axon, apical dendrite, ...) normalized between 0 and 1.
    v: number
}

export function parseSwc(content: string) {
    const nodes: CellNode[] = []
    for (const rawLine of forEachLine(content)) {
        const line = stripComment(rawLine)
        const items = line.split(/\s+/)
        if (items.length < 7) continue

        const [index, rawType, x, y, z, radius, parent] = items.map(s =>
            Number(s)
        )
        const type =
            rawType > 0 && rawType < 5
                ? (rawType as CellNodeType)
                : CellNodeType.Unknown
        nodes.push({
            index,
            parent,
            type,
            x,
            y,
            z,
            radius,
            u: 0,
            v: getTextureCoordFromType(type),
        })
    }
    return nodes
}

function stripComment(line: string): string {
    const pos = line.indexOf("#")
    if (pos < 0) return line

    return line.substring(0, pos).trim()
}

function getTextureCoordFromType(type: CellNodeType): number {
    return (getIndexFromType(type) + 0.5) / 5
}

function getIndexFromType(type: CellNodeType): number {
    switch (type) {
        case CellNodeType.Soma:
            return 0
        case CellNodeType.Axon:
            return 1
        case CellNodeType.ApicalDendrite:
            return 2
        case CellNodeType.BasalDendrite:
            return 3
        default:
            return 4
    }
}
