import { vec3 } from "gl-matrix";
export declare class Wgl2DirtyVector3 {
    private readonly onChange;
    private _x;
    private _y;
    private _z;
    constructor(onChange: (me: Wgl2DirtyVector3) => void, x?: number, y?: number, z?: number);
    set([x, y, z]: Iterable<number>): void;
    setYZX([x, y, z]: Iterable<number>): void;
    asArray(): [number, number, number];
    asVec3(): vec3;
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get z(): number;
    set z(value: number);
}
//# sourceMappingURL=vector3.d.ts.map