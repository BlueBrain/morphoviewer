export declare enum CellNodeType {
    Soma = 1,
    Axon = 2,
    BasalDendrite = 3,
    ApicalDendrite = 4,
    Unknown = 666
}
export interface CellNode {
    index: number;
    parent: number;
    type: CellNodeType;
    x: number;
    y: number;
    z: number;
    radius: number;
    u: number;
    v: number;
}
export declare function parseSwc(content: string): CellNode[];
//# sourceMappingURL=swc.d.ts.map