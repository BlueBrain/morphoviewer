export type TgdColorRGBA = [
    red: number,
    green: number,
    blue: number,
    alpha: number
]

/**
 * @param color CSS color string
 * @returns The 4 components of a color in floats between 0.0 and 1.0
 */
export function tgdColorParse(color: string): TgdColorRGBA {
    const ctx = getContext()
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const bitmap = ctx.getImageData(0, 0, 1, 1)
    const [R, G, B, A] = bitmap.data
    return [R / 255, G / 255, B / 255, A / 255]
}

export function tgdColorToString(color: TgdColorRGBA): string {
    const [R, G, B, A] = color
    return `#${hex(R)}${hex(G)}${hex(B)}${hex(A)}`
}
