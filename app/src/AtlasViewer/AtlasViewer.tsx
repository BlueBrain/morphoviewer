import React from "react"
import { AtlasPainter } from "@bbp/morphoviewer"

import { classNames } from "@/util/utils"

import styles from "./atlas-viewer.module.css"

export interface AtlasViewerProps {
    className?: string
}

export function AtlasViewer({ className }: AtlasViewerProps) {
    const refPainter = React.useRef(new AtlasPainter(loadMesh))
    const refCanvas = React.useRef<HTMLCanvasElement | null>(null)
    React.useEffect(() => {
        const painter = refPainter.current
        painter.canvas = refCanvas.current
        painter.showMesh("HypothalamicMedialZone")
        painter.showMesh("Brain")
    })
    return (
        <div className={classNames(styles.main, className)}>
            <canvas ref={refCanvas}>MorphologyViewer</canvas>
        </div>
    )
}

async function loadMesh(id: string): Promise<string> {
    const resp = await fetch(`mesh/${id}.obj`)
    return await resp.text()
}
