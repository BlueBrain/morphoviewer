import { Wgl2DirtyScalar } from "./../dirty/scalar";
import { Wgl2DirtySize } from "../dirty/size";
import { Wgl2DirtyVector3 } from "../dirty/vector3";
export declare class Wgl2Camera {
    private dirty;
    private readonly matrixView;
    private readonly matrixProjection;
    private readonly orientation;
    private readonly axis;
    private readonly axisX;
    private readonly axisY;
    private readonly axisZ;
    private readonly position;
    private readonly listeners;
    readonly target: Wgl2DirtyVector3;
    readonly near: Wgl2DirtyScalar;
    readonly far: Wgl2DirtyScalar;
    readonly distance: Wgl2DirtyScalar;
    readonly viewport: Wgl2DirtySize;
    constructor();
    addEventListener(type: "change", listener: () => void): void;
    removeEventListener(type: "change", listener: () => void): void;
    setUniforms(gl: WebGL2RenderingContext, locationView: WebGLUniformLocation, locationProjection: WebGLUniformLocation): void;
    facePosZ(): void;
    rotateAroundXY(radX: number, radY: number): void;
    private readonly handleDirty;
    private updateIfDirty;
}
//# sourceMappingURL=camera.d.ts.map