export function padColOfNumbers(values: number[], decimals = 6): string[] {
    const p = Math.pow(10, decimals)
    const out: string[] = []
    let max = 0
    for (const val of values) {
        const n = Math.round(val * p) / p
        const txt = n.toFixed(decimals)
        max = Math.max(max, txt.length)
        out.push(txt)
    }
    return out.map(txt => txt.padStart(max, " "))
}
