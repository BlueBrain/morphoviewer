export type Vector2 = [x: number, y: number];
export type Vector3 = [x: number, y: number, z: number];
export type Quaternion = [x: number, y: number, z: number, w: number];
export type Vector = Vector2 | Vector3 | Quaternion;
export declare function isZero(x: number): boolean;
export declare function project(vector: Vector3, base: Vector3): number;
export declare function vectorSquareLength(vec: number[]): number;
export declare function vectorLength(vec: number[]): number;
export declare function normalize<T extends Vector>(vec: T): T;
export declare function subtractVectors<T extends Vector>(a: T, b: T): T;
export declare function addVectors<T extends Vector>(...vectors: T[]): T;
export declare function scaleVector<T extends Vector>(v: T, scale: number): T;
export declare function computeBoundingBox(points: Vector3[]): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
};
export declare function crossProduct(vecA: Vector3, vecB: Vector3): Vector3;
export declare function clamp(value: number, min: number, max: number): number;
export declare function range(size: number, transfo?: (value: number) => number): number[];
export declare function intervals(from: number, to: number, count: number): number[];
//# sourceMappingURL=calc.d.ts.map