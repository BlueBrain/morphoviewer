import React from "react"
import { ColoringType, MorphologyPainter } from "@bbp/morphoviewer"

import styles from "./morphology-viewer.module.css"
import { FileUpload } from "@/FileUpload"
import { Legend } from "@/Legend"
import { toggleFullscreen } from "@/fullscreen"
import { useSignal } from "./signal"
import { InputNumber } from "@/InputNumber"

export interface MorphologyViewerProps {
    swc: string
}

interface Scalebar {
    sizeInPixel: number
    value: number
    unit: string
}

export function MorphologyViewer({ swc }: MorphologyViewerProps) {
    const [warning, setWarning] = useSignal(3000)
    const refDiv = React.useRef<HTMLDivElement | null>(null)
    const refPainter = React.useRef(new MorphologyPainter())
    const scalebar = useScalebar(refPainter.current)
    const [minRadius, setMinRadius] = React.useState(1.5)
    const [radiusMultiplier, setRadiusMultiplier] = useRadiusMultiplier(
        refPainter.current,
        1
    )
    const [radiusType, setRadiusType] = useRadiusType(refPainter.current, 0)
    const [colorBy, setColorBy] = useColorBy(refPainter.current, "section")
    const refCanvas = React.useRef<HTMLCanvasElement | null>(null)
    React.useEffect(() => {
        const painter = refPainter.current
        painter.canvas = refCanvas.current
        painter.swc = swc
        painter.colors.background = "#fff"

        const handleWarning = () => {
            setWarning(true)
        }
        painter.eventMouseWheelWithoutCtrl.addListener(handleWarning)
        return () =>
            painter.eventMouseWheelWithoutCtrl.removeListener(handleWarning)
    }, [swc])
    const handleFileLoaded = (content: string) => {
        refPainter.current.swc = content
    }
    const otherColoringMethod: ColoringType =
        colorBy === "section" ? "distance" : "section"
    const handleFullscreen = () => {
        const div = refDiv.current
        if (!div) return

        console.log("🚀 [MorphologyViewer] div = ", div) // @FIXME: Remove this line written on 2024-01-08 at 10:33
        void toggleFullscreen(div)
    }
    const handleResetCamera = () => {
        refPainter.current.resetCamera()
    }
    const handleMinRadiusChange = (value: number) => {
        refPainter.current.minRadius = value
    }
    return (
        <div className={styles.main} ref={refDiv}>
            <canvas ref={refCanvas}>MorphologyViewer</canvas>
            {scalebar && (
                <div
                    className={styles.scalebar}
                    style={{ width: `${scalebar.sizeInPixel}px` }}
                >
                    {scalebar.value} {scalebar.unit}
                </div>
            )}
            <Legend className={styles.legend} painter={refPainter.current} />
            <header>
                <FileUpload onLoaded={handleFileLoaded}>
                    Import SWC file
                </FileUpload>
                <button
                    type="button"
                    onClick={() => setColorBy(otherColoringMethod)}
                >
                    Color by <b>{otherColoringMethod}</b>
                </button>
                <button
                    className={styles.small}
                    type="button"
                    onClick={handleResetCamera}
                    title="Reset camera"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>axis-arrow</title>
                        <path d="M12,2L16,6H13V13.85L19.53,17.61L21,15.03L22.5,20.5L17,21.96L18.53,19.35L12,15.58L5.47,19.35L7,21.96L1.5,20.5L3,15.03L4.47,17.61L11,13.85V6H8L12,2Z" />
                    </svg>
                </button>
                <button
                    className={styles.small}
                    type="button"
                    onClick={handleFullscreen}
                    title="Toggle fullscreen"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>fullscreen</title>
                        <path d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" />
                    </svg>
                </button>
                <a href="https://neuromorpho.org/" target="_blank">
                    Find more files...
                </a>
            </header>
            <footer>
                <div>
                    <div>Thickness:</div>
                    <div>{(100 * radiusMultiplier).toFixed(0)} %</div>
                    <input
                        type="range"
                        min={0.5}
                        max={5}
                        step={0.01}
                        value={radiusMultiplier}
                        onChange={evt =>
                            setRadiusMultiplier(Number(evt.target.value))
                        }
                    />
                </div>
                <div>
                    <div>Variable</div>
                    <div>Constant</div>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={radiusType}
                        onChange={evt =>
                            setRadiusType(Number(evt.target.value))
                        }
                    />
                </div>
                <InputNumber
                    label="Min Radius"
                    value={minRadius}
                    onChange={handleMinRadiusChange}
                />
            </footer>
            <div
                className={`${styles.warning} ${
                    warning ? styles.show : styles.hide
                }`}
                onPointerDown={() => setWarning(false)}
            >
                <div>Hold Ctrl key to zoom</div>
            </div>
        </div>
    )
}

function useRadiusMultiplier(
    painter: MorphologyPainter,
    value: number
): [number, (value: number) => void] {
    const [radiusMultiplier, setRadiusMultiplier] = React.useState(value)
    React.useEffect(() => {
        painter.radiusMultiplier = radiusMultiplier
    }, [radiusMultiplier])
    return [radiusMultiplier, setRadiusMultiplier]
}

function useRadiusType(
    painter: MorphologyPainter,
    value: number
): [number, (value: number) => void] {
    const [radiusType, setRadiusType] = React.useState(value)
    React.useEffect(() => {
        painter.radiusType = radiusType
    }, [radiusType])
    return [radiusType, setRadiusType]
}

function useColorBy(
    painter: MorphologyPainter,
    value: ColoringType
): [ColoringType, (value: ColoringType) => void] {
    const [colorBy, setColorBy] = React.useState(value)
    React.useEffect(() => {
        painter.colorBy = colorBy
    }, [colorBy])
    return [colorBy, setColorBy]
}

function useScalebar(painter: MorphologyPainter): Scalebar | null {
    const [scalebar, setScalebar] = React.useState(painter.computeScalebar())
    React.useEffect(() => {
        const update = () => {
            setScalebar(painter.computeScalebar())
        }
        painter.eventPixelScaleChange.addListener(update)
        return () => painter.eventPixelScaleChange.removeListener(update)
    }, [painter])
    return scalebar
}
