export interface ScalebarOptions {
    preferedSizeInPixels: number
    units: Record<string, number>
    values: number[]
}

export function computeScalebarAttributes(
    pixelScale: number,
    {
        preferedSizeInPixels = 240,
        units = {
            nm: 1e-3,
            µm: 1,
            mm: 1e3,
            m: 1e6,
            km: 1e9,
        },
        values = [
            1, 2, 5, 10, 20, 25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800,
            900,
        ],
    }: Partial<ScalebarOptions> = {}
): {
    sizeInPixel: number
    value: number
    unit: string
} | null {
    const target = pixelScale * preferedSizeInPixels
    for (const unit of Object.keys(units)) {
        const factor = units[unit] ?? 1
        const targetWithUnit = target / factor
        for (const value of values) {
            if (value >= targetWithUnit) {
                return {
                    sizeInPixel: (value * factor) / pixelScale,
                    value,
                    unit,
                }
            }
        }
    }
    return null
}
