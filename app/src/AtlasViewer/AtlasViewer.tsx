import React from "react"
import { AtlasCanvas } from "@bbp/morphoviewer"

import { classNames } from "@/util/utils"

import styles from "./atlas-viewer.module.css"
import { tgdFullscreenToggle } from "@bbp/morphoviewer"

export interface AtlasViewerProps {
    className?: string
}

export function AtlasViewer({ className }: AtlasViewerProps) {
    const refPainter = React.useRef(new AtlasCanvas({ alpha: true }))
    const refDiv = React.useRef<HTMLDivElement | null>(null)
    const handleFullscreen = () => {
        const div = refDiv.current
        if (!div) return

        void tgdFullscreenToggle(div)
    }
    const handleSnapshot = () => {
        alert("Not implemented yet!")
    }
    const refCanvas = React.useRef<HTMLCanvasElement | null>(null)
    React.useEffect(() => {
        const painter = refPainter.current
        painter.backgroundColor = [0, 0, 0, 0]
        painter.canvas = refCanvas.current
        const { camera } = painter
        camera.setTarget(6587.5015, 3849.2866, 5687.4893)
        camera.distance = 12000
        camera.setOrientation(-0.707107, 0.0, 0.0, -0.707107)
        // loadWaveFrontMesh("Brain")
        loadWaveFrontMesh("test")
            .then(content => {
                painter.meshGhostLoadFromObj(content, {})
            })
            .catch(console.error)
        // painter.showMesh("Brain", {
        //     color: [1, 1, 1, 0.3],
        // })
        // painter.showMesh("HypothalamicMedialZone", {
        //     color: [0.0, 0.5, 1.0, 1],
        // })
        // painter.showMesh("CerebellarCortex", {
        //     color: [1, 0.0, 0, 1],
        // })
        // painter.showCloud("cloud.bin", { color: [0.1, 1, 0.1, 1], radius: 5 })
    })
    return (
        <div ref={refDiv} className={classNames(styles.main, className)}>
            <canvas ref={refCanvas}>MorphologyViewer</canvas>
            <header>
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
    console.log("Loading...")
    const resp = await fetch("./cloud/cloud.bin")
    const data = await resp.arrayBuffer()
    console.log("Loaded", data.byteLength, "bytes")
    const array = new Float32Array(data)
    return array // .slice(0, 300)
}
