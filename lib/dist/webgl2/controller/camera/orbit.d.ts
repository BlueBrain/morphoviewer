import { Wgl2Camera } from "@/webgl2/camera/camera";
export declare class Wgl2ControllerCameraOrbit {
    private readonly camera;
    private readonly options;
    private readonly gestures;
    constructor(camera: Wgl2Camera, options?: Partial<{
        onChange: () => void;
    }>);
    attach(canvas: HTMLCanvasElement): void;
    detach(): void;
    private readonly handleZoom;
    private readonly handleStart;
    private readonly handleMove;
}
//# sourceMappingURL=orbit.d.ts.map