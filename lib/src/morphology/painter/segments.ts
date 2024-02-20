import { TgdPainterSegmentsData } from "@tgd"

import { CellNodeType } from "@/types"
import { CellNodes } from "./nodes"

export class Segments {
    private _data: TgdPainterSegmentsData | null = null
    private _count = 0
    private readonly nodesXYZR: [
        x: number,
        y: number,
        z: number,
        radius: number
    ][] = []
    private readonly nodesUV: [u: number, v: number][] = []
    private readonly nodesInfluence: number[] = []
    private readonly attAxyzr: number[][] = []
    private readonly attAuv: number[][] = []
    private readonly attAinfluence: number[] = []
    private readonly attBxyzr: number[][] = []
    private readonly attBuv: number[][] = []
    private readonly attBinfluence: number[] = []
    private readonly elemByIndex = new Map<number, number>()

    constructor(nodes: CellNodes) {
        nodes.forEach(({ index, type, x, y, z, radius, u, v }) => {
            const elem = this.nodesUV.length
            this.nodesXYZR.push([x, y, z, radius])
            this.nodesUV.push([u, v])
            this.nodesInfluence.push(type === CellNodeType.Soma ? 0 : 1)
            this.elemByIndex.set(index, elem)
        })
    }

    get count() {
        return this._count
    }

    addSegment(indexNodeA: number, indexNodeB: number) {
        const { data } = this
        const elemA = this.elemByIndex.get(indexNodeA)
        if (typeof elemA !== "number") return

        const elemB = this.elemByIndex.get(indexNodeB)
        if (typeof elemB !== "number") return

        const nodeAxyzr = this.nodesXYZR[elemA]
        const nodeBxyzr = this.nodesXYZR[elemB]
        const nodeAuv = this.nodesUV[elemA]
        const nodeBuv = this.nodesUV[elemB]
        const influenceA = this.nodesInfluence[elemA]
        const influenceB = this.nodesInfluence[elemB]
        const [, aV] = nodeAuv
        const [, bV] = nodeBuv
        if (aV === bV) {
            // This segment as the same color on both tips.
            this.pushA(nodeAxyzr, nodeAuv, influenceA)
            this.pushB(nodeBxyzr, nodeBuv, influenceB)
            data.add(nodeAxyzr, nodeAuv, nodeBxyzr, nodeBuv)
            this._count++
        } else {
            // We need to split this segment in two parts.
            // So each part will have an uniform color.
            const [xA, yA, zA, rA] = nodeAxyzr
            const [xB, yB, zB, rB] = nodeBxyzr
            const nodeCxyzr: [number, number, number, number] = [
                (xA + xB) * 0.5,
                (yA + yB) * 0.5,
                (zA + zB) * 0.5,
                (rA + rB) * 0.5,
            ]
            this.pushA(nodeAxyzr, nodeAuv, influenceA)
            this.pushB(nodeCxyzr, nodeAuv, influenceA)
            data.add(nodeAxyzr, nodeAuv, nodeCxyzr, nodeAuv)
            this._count++
            this.pushA(nodeCxyzr, nodeBuv, influenceB)
            this.pushB(nodeBxyzr, nodeBuv, influenceB)
            data.add(nodeCxyzr, nodeBuv, nodeBxyzr, nodeBuv)
            this._count++
        }
    }

    get data() {
        if (!this._data) {
            this._data = new TgdPainterSegmentsData()
            for (let i = 0; i < this.attAxyzr.length; i++) {
                const Axyzr = this.attAxyzr[i] as [
                    number,
                    number,
                    number,
                    number
                ]
                const Auv = this.attAuv[i] as [number, number]
                const Bxyzr = this.attBxyzr[i] as [
                    number,
                    number,
                    number,
                    number
                ]
                const Buv = this.attBuv[i] as [number, number]
                this._data.add(Axyzr, Auv, Bxyzr, Buv)
            }
        }
        return this._data
    }

    private pushA(
        xyzr: [x: number, y: number, z: number, radius: number],
        uv: [u: number, v: number],
        influence: number
    ) {
        this.attAxyzr.push(xyzr)
        this.attAuv.push(uv)
        this.attAinfluence.push(influence)
    }

    private pushB(
        xyzr: [x: number, y: number, z: number, radius: number],
        uv: [u: number, v: number],
        influence: number
    ) {
        this.attBxyzr.push(xyzr)
        this.attBuv.push(uv)
        this.attBinfluence.push(influence)
    }
}
