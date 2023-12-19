import { Wgl2DirtyScalar } from "../dirty/scalar";
import { Wgl2Camera } from "./camera";
export declare abstract class Wgl2CameraPerspective extends Wgl2Camera {
    readonly distance: Wgl2DirtyScalar;
    constructor();
    protected updateView(): void;
    protected updateProjection(): void;
}
//# sourceMappingURL=camera-perspective.d.ts.map