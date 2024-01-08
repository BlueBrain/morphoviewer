import { Wgl2Attributes } from "@/webgl2/attributes";
import { CellNodes } from "./nodes";
export declare class Segments {
    private _count;
    private readonly nodesXYZR;
    private readonly nodesUV;
    private readonly nodesInfluence;
    private readonly attAxyzr;
    private readonly attBxyzr;
    private readonly attAuv;
    private readonly attBuv;
    private readonly attAinfluence;
    private readonly attBinfluence;
    private readonly elemByIndex;
    constructor(nodes: CellNodes);
    get count(): number;
    addSegment(indexNodeA: number, indexNodeB: number): void;
    makeAttributes(divisor?: number): Wgl2Attributes;
}
//# sourceMappingURL=segments.d.ts.map