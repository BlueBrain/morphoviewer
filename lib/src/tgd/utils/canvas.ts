export function tgdCreateCanvas2D(
    width: number,
    height: number,
    settings?: CanvasRenderingContext2DSettings
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d", settings)
    if (!ctx) throw Error("Unable to create 2D context!")

    return { canvas, ctx }
}
