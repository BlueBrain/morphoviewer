import { Wgl2Attributes } from "@/webgl2/attributes";
export declare class Wgl2Resources {
    readonly gl: WebGL2RenderingContext;
    private readonly programs;
    private readonly buffers;
    constructor(gl: WebGL2RenderingContext);
    cleanUp(): void;
    createProgram(code: {
        vert: string;
        frag: string;
    }): WebGLProgram;
    createBuffer(): WebGLBuffer;
    createVAO(prg: WebGLProgram, ...attributes: (Wgl2Attributes | ((res: Wgl2Resources) => void) | Uint8Array | Uint16Array | Uint32Array)[]): WebGLVertexArrayObject;
    getUniformsLocations(prg: WebGLProgram): {
        [name: string]: WebGLUniformLocation;
    };
}
//# sourceMappingURL=resources.d.ts.map