export function clamp(value: number, min: number, max: number): number {
    if (value < min) return min
    if (value > max) return max
    return value
}

export function mix(a: number, b: number, t: number): number {
    return (1 - t) * a + t * b
}
