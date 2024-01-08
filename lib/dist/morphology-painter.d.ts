import Colors from "./colors";
import { ScalebarOptions } from "./scalebar";
import { ColoringType } from "./types";
import { Wgl2Event } from "./webgl2/event";
export declare class MorphologyPainter {
    readonly colors: Colors;
    readonly eventPixelScaleChange: Wgl2Event<number>;
    readonly eventMouseWheelWithoutCtrl: Wgl2Event<void>;
    private previousCameraHeight;
    private previousCameraZoom;
    private previousViewportHeight;
    private _swc;
    private _canvas;
    private nodes;
    private paintingIsScheduled;
    private painter;
    private readonly _camera;
    private readonly orbiter;
    private _colorBy;
    private _radiusType;
    private _radiusMultiplier;
    constructor();
    toggleFullscreen(): void;
    readonly resetCamera: () => void;
    get pixelScale(): number;
    computeScalebar(options?: Partial<ScalebarOptions>): {
        sizeInPixel: number;
        value: number;
        unit: string;
    } | null;
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
    private readonly handleMouseWheel;
    private readonly handlePixelScaleDispatch;
}
//# sourceMappingURL=morphology-painter.d.ts.map