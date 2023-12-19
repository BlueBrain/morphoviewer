import { Wgl2Camera } from "./camera";
import { Wgl2DirtyScalar } from "../dirty/scalar";
export declare class Wgl2CameraOrthographic extends Wgl2Camera {
    readonly height: Wgl2DirtyScalar;
    constructor();
    protected updateProjection(): void;
    protected updateView(): void;
}
//# sourceMappingURL=camera-orthographic.d.ts.map