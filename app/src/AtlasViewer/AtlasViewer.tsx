import React from "react"
import { AtlasPainter } from "@bbp/morphoviewer"

import { classNames } from "@/util/utils"

import styles from "./atlas-viewer.module.css"
import { toggleFullscreen } from "@/fullscreen"

export interface AtlasViewerProps {
    className?: string
}

export function AtlasViewer({ className }: AtlasViewerProps) {
    const refPainter = React.useRef(
        new AtlasPainter({ alpha: true, loadWaveFrontMesh, loadCloud })
    )
    const [smoothness, setSmoothness] = React.useState(
        refPainter.current.smoothness
    )
    const [highlight, setHighlight] = React.useState(
        refPainter.current.highlight
    )
    const refDiv = React.useRef<HTMLDivElement | null>(null)
    const handleFullscreen = () => {
        const div = refDiv.current
        if (!div) return

        void toggleFullscreen(div)
    }
    const handleSnapshot = () => {
        const painter = refPainter.current
        painter
            .takeSnapshot()
            .then(canvas => {
                window.open(canvas.toDataURL(), "snapshot")
            })
            .catch(console.error)
    }
    const refCanvas = React.useRef<HTMLCanvasElement | null>(null)
    React.useEffect(() => {
        const painter = refPainter.current
        painter.backgroundColor = [0, 0, 0, 0]
        painter.canvas = refCanvas.current
        painter.showMesh("Brain", {
            color: [1, 1, 1, 0.3],
        })
        painter.showMesh("HypothalamicMedialZone", {
            color: [0.0, 0.5, 1.0, 1],
        })
        painter.showMesh("CerebellarCortex", {
            color: [1, 0.0, 0, 1],
        })
        painter.showCloud("cloud.bin", { color: [0.1, 1, 0.1, 1], radius: 5 })
    })
    return (
        <div ref={refDiv} className={classNames(styles.main, className)}>
            <canvas ref={refCanvas}>MorphologyViewer</canvas>
            <header>
                <div>
                    <div>Thickness:</div>
                    <div>{(100 * smoothness).toFixed(0)} %</div>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={smoothness}
                        onChange={evt => {
                            const newSmoothness = Number(evt.target.value)
                            setSmoothness(newSmoothness)
                            refPainter.current.smoothness = newSmoothness
                        }}
                    />
                </div>
                <div>
                    <div>Highlight:</div>
                    <div>{(100 * highlight).toFixed(0)} %</div>
                    <input
                        type="range"
                        min={0}
                        max={2}
                        step={0.01}
                        value={highlight}
                        onChange={evt => {
                            const newHighlight = Number(evt.target.value)
                            setHighlight(newHighlight)
                            refPainter.current.highlight = newHighlight
                        }}
                    />
                </div>

                <button type="button" onClick={handleFullscreen}>
                    Fullscreen
                </button>
                <button type="button" onClick={handleSnapshot}>
                    Snapshot
                </button>
            </header>
        </div>
    )
}

async function loadWaveFrontMesh(id: string): Promise<string> {
    const resp = await fetch(`mesh/${id}.obj`)
    return await resp.text()
}

async function loadCloud(_id: string): Promise<Float32Array> {
    const resp = await fetch("./cloud/cloud.bin")
    const data = await resp.arrayBuffer()
    return new Float32Array(data)
}
