export interface ScalebarOptions {
    preferedSizeInPixels: number;
    units: Record<string, number>;
    values: number[];
}
export declare function computeScalebarAttributes(pixelScale: number, { preferedSizeInPixels, units, values, }?: Partial<ScalebarOptions>): {
    sizeInPixel: number;
    value: number;
    unit: string;
} | null;
//# sourceMappingURL=scalebar.d.ts.map