import { Wgl2Attributes } from "@/webgl2/attributes"
import { CellNodes } from "./nodes"
import { CellNodeType } from "@/parser/swc"

export class Segments {
    private _count = 0
    private readonly nodesXYZR: [
        x: number,
        y: number,
        z: number,
        radius: number
    ][] = []
    private readonly nodesUV: [u: number, v: number][] = []
    private readonly nodesInfluence: number[] = []
    private readonly attAxyzr: number[] = []
    private readonly attBxyzr: number[] = []
    private readonly attAuv: number[] = []
    private readonly attBuv: number[] = []
    private readonly attAinfluence: number[] = []
    private readonly attBinfluence: number[] = []
    private readonly elemByIndex = new Map<number, number>()

    constructor(private readonly nodes: CellNodes) {
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
        const elemA = this.elemByIndex.get(indexNodeA)
        if (typeof elemA !== "number") return

        const elemB = this.elemByIndex.get(indexNodeB)
        if (typeof elemB !== "number") return

        const nodeAxyzr = this.nodesXYZR[elemA]
        const nodeBxyzr = this.nodesXYZR[elemB]
        this.attAxyzr.push(...nodeAxyzr)
        this.attBxyzr.push(...nodeBxyzr)
        const nodeAuv = this.nodesUV[elemA]
        const nodeBuv = this.nodesUV[elemB]
        this.attAuv.push(...nodeAuv)
        this.attBuv.push(...nodeBuv)
        this.attAinfluence.push(this.nodesInfluence[elemA])
        this.attBinfluence.push(this.nodesInfluence[elemB])
        this._count++
    }

    makeAttributes(divisor = 1): Wgl2Attributes {
        const att = new Wgl2Attributes(
            {
                attAxyzr: 4,
                attBxyzr: 4,
                attAuv: 2,
                attBuv: 2,
                attAinfluence: 1,
                attBinfluence: 1,
            },
            divisor
        )
        att.set("attAxyzr", new Float32Array(this.attAxyzr))
        att.set("attBxyzr", new Float32Array(this.attBxyzr))
        att.set("attAuv", new Float32Array(this.attAuv))
        att.set("attBuv", new Float32Array(this.attBuv))
        att.set("attAinfluence", new Float32Array(this.attAinfluence))
        att.set("attBinfluence", new Float32Array(this.attBinfluence))
        return att
    }
}
