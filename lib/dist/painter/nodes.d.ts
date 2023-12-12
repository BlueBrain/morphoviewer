import { CellNode } from "@/parser/swc";
import { Vector3 } from "@/webgl2/calc";
export interface Branch {
    node: CellNode;
    children: Branch[];
}
export declare class CellNodes {
    private readonly nodes;
    readonly averageRadius: number;
    readonly center: Vector3;
    readonly bbox: Vector3;
    readonly tree: Branch;
    private readonly nodesByIndex;
    constructor(nodes: CellNode[]);
    getByIndex(index: number): CellNode | undefined;
    forEach(callback: (node: CellNode, index: number) => void): void;
    computeDistancesFromSoma(): void;
    private buildTree;
}
//# sourceMappingURL=nodes.d.ts.map