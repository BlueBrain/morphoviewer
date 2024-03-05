import {
    ColoringType,
    GizmoCanvas,
    MorphologyCanvas,
    tgdFullscreenToggle,
} from "@bbp/morphoviewer"
import React from "react"

import { FileUpload } from "@/FileUpload"
import { InputNumber } from "@/InputNumber"
import { Legend } from "@/Legend"
import { useSignal } from "./signal"

import styles from "./morphology-viewer.module.css"

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
    const refMorphoPainter = React.useRef(new MorphologyCanvas())
    const refGizmoCanvas = React.useRef(new GizmoCanvas())
    const scalebar = useScalebar(refMorphoPainter.current)
    const [minRadius, setMinRadius] = React.useState(1)
    const [radiusMultiplier, setRadiusMultiplier] = useRadiusMultiplier(
        refMorphoPainter.current,
        1
    )
    const [radiusType, setRadiusType] = useRadiusType(
        refMorphoPainter.current,
        0
    )
    const [colorBy, setColorBy] = useColorBy(
        refMorphoPainter.current,
        "section"
    )
    const refCanvas = React.useRef<HTMLCanvasElement | null>(null)
    React.useEffect(() => {
        const gizmoPainter = refGizmoCanvas.current
        const morphoPainter = refMorphoPainter.current
        morphoPainter.canvas = refCanvas.current
        morphoPainter.swc = swc
        morphoPainter.colors.background = "#fff"
        // Synchronized cameras.
        gizmoPainter.attachCamera(morphoPainter.camera)
        const handleWarning = () => {
            setWarning(true)
        }
        morphoPainter.eventMouseWheelWithoutCtrl.addListener(handleWarning)
        gizmoPainter.eventTipClick.addListener(morphoPainter.interpolateCamera)
        return () => {
            morphoPainter.eventMouseWheelWithoutCtrl.removeListener(
                handleWarning
            )
            gizmoPainter.eventTipClick.removeListener(
                morphoPainter.interpolateCamera
            )
        }
    }, [swc])
    const handleFileLoaded = (content: string) => {
        refMorphoPainter.current.swc = content
    }
    const otherColoringMethod: ColoringType =
        colorBy === "section" ? "distance" : "section"
    const handleFullscreen = () => {
        const div = refDiv.current
        if (!div) return

        void tgdFullscreenToggle(div)
    }
    const handleResetCamera = () => {
        refMorphoPainter.current.resetCamera()
    }
    const handleMinRadiusChange = (value: number) => {
        setMinRadius(value)
        refMorphoPainter.current.minRadius = value
    }
    const handleSnapshot = () => {
        const canvas = document.createElement("canvas")
        canvas.width = 2048
        canvas.height = 2048
        refMorphoPainter.current.takeSnapshot(canvas)
        window.open(canvas.toDataURL("image/webp"), "snapshot")
    }
    return (
        <div className={styles.main} ref={refDiv}>
            <canvas ref={refCanvas}>MorphologyViewer</canvas>
            <canvas
                ref={canvas => (refGizmoCanvas.current.canvas = canvas)}
                className={styles.gizmo}
            ></canvas>
            {scalebar && (
                <div
                    className={styles.scalebar}
                    style={{ width: `${scalebar.sizeInPixel}px` }}
                >
                    {scalebar.value} {scalebar.unit}
                </div>
            )}
            <Legend
                className={styles.legend}
                painter={refMorphoPainter.current}
            />
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
                <button type="button" onClick={handleSnapshot}>
                    SnapShot
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
    painter: MorphologyCanvas,
    value: number
): [number, (value: number) => void] {
    const [radiusMultiplier, setRadiusMultiplier] = React.useState(value)
    React.useEffect(() => {
        painter.radiusMultiplier = radiusMultiplier
    }, [radiusMultiplier])
    return [radiusMultiplier, setRadiusMultiplier]
}

function useRadiusType(
    painter: MorphologyCanvas,
    value: number
): [number, (value: number) => void] {
    const [radiusType, setRadiusType] = React.useState(value)
    React.useEffect(() => {
        painter.radiusType = radiusType
    }, [radiusType])
    return [radiusType, setRadiusType]
}

function useColorBy(
    painter: MorphologyCanvas,
    value: ColoringType
): [ColoringType, (value: ColoringType) => void] {
    const [colorBy, setColorBy] = React.useState(value)
    React.useEffect(() => {
        painter.colorBy = colorBy
    }, [colorBy])
    return [colorBy, setColorBy]
}

function useScalebar(painter: MorphologyCanvas): Scalebar | null {
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
