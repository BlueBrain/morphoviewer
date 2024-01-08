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
    private static keysPressed;
    private static attachmentsCount;
    private canvas;
    private active;
    private canvasX;
    private canvasY;
    private screenX;
    private screenY;
    private static readonly handleKeyDown;
    private static readonly handleKeyUp;
    constructor(options: Partial<{
        canvas: HTMLCanvasElement | null;
        onMoveStart: (args: Wgl2Pointer) => void;
        onMove: (args: {
            current: Wgl2Pointer;
            previous: Wgl2Pointer;
            start: Wgl2Pointer;
        }) => void;
        onMoveEnd: (args: Wgl2Pointer) => void;
        onZoom: (direction: number, preventDefault: () => void) => void;
    }>);
    get element(): HTMLCanvasElement | null;
    isKeyDown(key: string): boolean;
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