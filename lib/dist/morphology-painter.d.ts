import Colors from "./colors";
import { ColoringType } from "./types";
export declare class MorphologyPainter {
    readonly colors: Colors;
    private _swc;
    private _canvas;
    private nodes;
    private paintingIsScheduled;
    private painter;
    private grid;
    private readonly _camera;
    private readonly orbiter;
    private _colorBy;
    private _radiusType;
    private _radiusMultiplier;
    constructor();
    resetCamera(): void;
    get colorBy(): ColoringType;
    set colorBy(value: ColoringType);
    get radiusType(): number;
    set radiusType(value: number);
    get radiusMultiplier(): number;
    set radiusMultiplier(value: number);
    get canvas(): HTMLCanvasElement | null;
    set canvas(canvas: HTMLCanvasElement | null);
    get swc(): string | null;
    set swc(swc: string | null);
    readonly paint: () => void;
    private readonly actualPaint;
    private readonly handleColorsChange;
    private init;
}
//# sourceMappingURL=morphology-painter.d.ts.map