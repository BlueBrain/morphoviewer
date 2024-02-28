/**
 * Helper to get a canvas with the given size.
 */
export function tgdCanvasCreate(
    width: number,
    height: number
): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    return canvas
}

/**
 * Helper to get a canvas of the given size and a 2D context on it.
 * If this is not possible, the method will throw an exception.
 */
export function tgdCanvasCreateWithContext2D(
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
