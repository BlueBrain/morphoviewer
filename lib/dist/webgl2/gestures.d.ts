export interface Wgl2Pointer {
    x: number;
    y: number;
    t: number;
}
export declare class Wgl2Gestures {
    private readonly options;
    start: Wgl2Pointer;
    current: Wgl2Pointer;
    previous: Wgl2Pointer;
    private canvas;
    private active;
    private canvasX;
    private canvasY;
    private screenX;
    private screenY;
    constructor(options: Partial<{
        canvas: HTMLCanvasElement | null;
        onMoveStart: (args: Wgl2Pointer) => void;
        onMove: (args: {
            current: Wgl2Pointer;
            previous: Wgl2Pointer;
            start: Wgl2Pointer;
        }) => void;
        onMoveEnd: (args: Wgl2Pointer) => void;
        onZoom: (direction: number) => void;
    }>);
    attach(canvas: HTMLCanvasElement): void;
    detach(): void;
    private readonly handleCanvasWheel;
    private readonly handleCanvasPointerDown;
    private readonly handlePointerDown;
    private readonly handlePointerMove;
    private readonly handlePointerUp;
    private getPoint;
}
//# sourceMappingURL=gestures.d.ts.map