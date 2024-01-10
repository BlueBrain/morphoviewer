import Colors from "@/colors";
import { Wgl2CameraOrthographic } from "@/webgl2/camera";
import { Wgl2Resources } from "@/webgl2/resources/resources";
import { CellNodes } from "./nodes";
export declare class SwcPainter {
    private readonly resources;
    private readonly camera;
    minRadius: number;
    private colors;
    private previousBackgroundColor;
    private readonly gl;
    private readonly prg;
    private readonly vao;
    private readonly texture;
    private readonly locations;
    private readonly instancesCount;
    private _radiusMultiplier;
    private readonly averageRadius;
    private _radiusType;
    private _colorBy;
    private textureIsOutOfDate;
    private readonly observer;
    private readonly canvas;
    constructor(resources: Wgl2Resources, nodes: CellNodes, camera: Wgl2CameraOrthographic);
    get colorBy(): "section" | "distance";
    set colorBy(value: "section" | "distance");
    get radiusType(): number;
    set radiusType(value: number);
    get radiusMultiplier(): number;
    set radiusMultiplier(value: number);
    readonly paint: (_time: number) => void;
    cleanUp(): void;
    resetColors(colors: Colors): void;
    private readonly setBackgroundColor;
    readonly refresh: () => void;
    private readonly handleResize;
}
//# sourceMappingURL=painter.d.ts.map