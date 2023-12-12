export interface Wgl2TypeAttribute {
    type: "float";
    dimension: number;
}
export type Wgl2TypeAttributesDefinitions = {
    [key: string]: Partial<Wgl2TypeAttribute> | number;
};
interface AttributeInternalRepresentation {
    dimension: number;
    divisor: number;
    bytesPerElement: number;
    bytesOffset: number;
    getter(this: void, view: DataView, byteOffset: number): number;
    setter(this: void, view: DataView, byteOffset: number, value: number): void;
}
export declare enum Elem {
    X = 0,
    Y = 1,
    Z = 2,
    W = 3
}
export declare class Wgl2Attributes {
    readonly divisor: number;
    readonly stride: number;
    buffer: WebGLBuffer | null;
    private arrayBuffer;
    private readonly data;
    private readonly definitions;
    private verticeCount;
    constructor(def: Wgl2TypeAttributesDefinitions, divisor?: number);
    getVerticeCount(): number;
    debug(): void;
    getNames(): string[];
    getDefinitions(): Wgl2TypeAttributesDefinitions;
    getAttribDef(attribName: string): AttributeInternalRepresentation | undefined;
    getGlslType(attribName: string): string;
    get(verticeCount?: number): ArrayBuffer;
    update(gl: WebGL2RenderingContext, verticeCount?: number, dynamic?: boolean): ArrayBuffer;
    define(gl: WebGL2RenderingContext, prg: WebGLProgram): void;
    set(attribName: string, value: ArrayBuffer): void;
    poke(attribName: string, vertexIndex: number, element: Elem, value: number): void;
    peek(attribName: string, vertexIndex: number, element: Elem): number;
    getBuffer(): WebGLBuffer;
    private checkIfWeHaveEnoughData;
}
export {};
//# sourceMappingURL=attributes.d.ts.map