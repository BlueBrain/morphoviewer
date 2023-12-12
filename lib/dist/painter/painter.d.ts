import { Wgl2Camera } from "@/webgl2/camera/camera";
import { Wgl2Resources } from "@/webgl2/resources/resources";
import { CellNodes } from "./nodes";
export declare class SwcPainter {
    private readonly resources;
    private readonly camera;
    private gl;
    private prg;
    private vao;
    private texture;
    private locations;
    private instancesCount;
    private _radiusMultiplier;
    private readonly averageRadius;
    private _radiusType;
    private _colorBy;
    private textureIsOutOfDate;
    private readonly observer;
    private readonly canvas;
    constructor(resources: Wgl2Resources, nodes: CellNodes, camera: Wgl2Camera);
    get colorBy(): "section" | "distance";
    set colorBy(value: "section" | "distance");
    get radiusType(): number;
    set radiusType(value: number);
    get radiusMultiplier(): number;
    set radiusMultiplier(value: number);
    readonly paint: (_time: number) => void;
    cleanUp(): void;
    private refresh;
    private readonly handleResize;
}
//# sourceMappingURL=painter.d.ts.map