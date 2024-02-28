import { tgdCanvasCreateWithContext2D } from "@/tgd"

export function getRegionsTextureCanvas({
    soma = "#777",
    axon = "#00f",
    basalDendrite = "#f00",
    apicalDendrite = "#f0f",
    unknown = "#9b9",
}: Partial<{
    soma: string
    axon: string
    apicalDendrite: string
    basalDendrite: string
    unknown: string
}> = {}): HTMLCanvasElement {
    const w = 1
    const h = 5
    const { ctx } = tgdCanvasCreateWithContext2D(w, h)
    const colors = [soma, axon, basalDendrite, apicalDendrite, unknown]
    colors.forEach((color, index) => {
        ctx.fillStyle = color
        const y = index
        ctx.fillRect(0, y, w, 1)
    })
    return ctx.canvas
}

export function getDistancesTextureCanvas(): HTMLCanvasElement {
    const w = 256
    const h = 1
    const ctx = createCanvas2DContext(w, h)
    const colors = ["#0f0", "#ff0", "#f00"]
    const grad = ctx.createLinearGradient(0, 0, w, h)
    colors.forEach((color, index) => {
        grad.addColorStop(index / (colors.length - 1), color)
    })
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    return ctx.canvas
}

function createCanvas2DContext(
    width: number,
    height: number
): CanvasRenderingContext2D {
    const canvas = document.createElement("canvas")
    if (!canvas) throw Error("Unable to create a HTMLCanvasElement!")

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) throw Error("Unable to create a 2D context!")

    return ctx
}
