import { Wgl2DirtyScalar } from "./../dirty/scalar";
import { Wgl2DirtySize } from "../dirty/size";
import { Wgl2DirtyVector3 } from "../dirty/vector3";
import { mat3, mat4, quat, vec3 } from "gl-matrix";
import { Wgl2Event } from "../event";
export declare abstract class Wgl2Camera {
    private dirty;
    protected readonly matrixView: mat4;
    protected readonly matrixProjection: mat4;
    protected readonly orientation: quat;
    protected readonly axis: mat3;
    protected readonly axisX: vec3;
    protected readonly axisY: vec3;
    protected readonly axisZ: vec3;
    protected readonly position: vec3;
    readonly eventChange: Wgl2Event<Wgl2Camera>;
    readonly target: Wgl2DirtyVector3;
    readonly near: Wgl2DirtyScalar;
    readonly far: Wgl2DirtyScalar;
    readonly zoom: Wgl2DirtyScalar;
    readonly viewport: Wgl2DirtySize;
    constructor();
    setUniforms(gl: WebGL2RenderingContext, locationView: WebGLUniformLocation, locationProjection: WebGLUniformLocation): void;
    facePosZ(): void;
    rotateAroundXY(radX: number, radY: number): void;
    protected readonly handleDirty: () => void;
    private updateIfDirty;
    protected abstract updateView(): void;
    protected abstract updateProjection(): void;
}
//# sourceMappingURL=camera.d.ts.map