"use client"

/* eslint-disable no-param-reassign */
import {
    GizmoCanvas,
    MorphologyCanvas,
    tgdFullscreenToggle,
} from "@bbp/morphoviewer"
import { useEffect, useRef } from "react"

import { ColorRamp } from "./ColorRamp"
import { Settings } from "./Settings"
import { Scalebar } from "./Scalebar"
import { Warning } from "./Warning"
import { useMorphoViewerSettings } from "./hooks/settings"
import { useSignal } from "./hooks/signal"
import { classNames } from "@/util/utils"

import styles from "./morpho-viewer.module.css"

export interface MorphoViewerProps {
    className?: string
    /**
     * Text content of a SWC file.
     */
    swc: string
}

export function MorphoViewer({ className, swc }: MorphoViewerProps) {
    const refDiv = useRef<HTMLDivElement | null>(null)
    const refMorphoCanvas = useRef(new MorphologyCanvas())
    const morphoCanvas = refMorphoCanvas.current
    const refGizmoCanvas = useRef(new GizmoCanvas())
    const gizmoCanvas = refGizmoCanvas.current
    const refCanvas = useRef<HTMLCanvasElement | null>(null)
    const [{ isDarkMode }] = useMorphoViewerSettings(morphoCanvas)
    const [warning, setWarning] = useSignal(10000)

    useEffect(() => {
        morphoCanvas.canvas = refCanvas.current
        morphoCanvas.swc = swc
        gizmoCanvas.attachCamera(morphoCanvas.camera)
        const handleWarning = () => {
            setWarning(true)
        }
        morphoCanvas.eventMouseWheelWithoutCtrl.addListener(handleWarning)
        gizmoCanvas.eventTipClick.addListener(morphoCanvas.interpolateCamera)
        return () => {
            morphoCanvas.eventMouseWheelWithoutCtrl.removeListener(
                handleWarning
            )
            gizmoCanvas.eventTipClick.removeListener(
                morphoCanvas.interpolateCamera
            )
        }
    }, [morphoCanvas, gizmoCanvas, setWarning, swc])

    const handleFullscreen = () => {
        const div = refDiv.current
        if (!div) return

        void tgdFullscreenToggle(div)
    }

    return (
        <div
            className={classNames(
                styles.main,
                className,
                isDarkMode && styles.darkMode
            )}
            ref={refDiv}
            onDoubleClick={handleFullscreen}
            data-testid="morpho-viewer"
        >
            <canvas className={styles.morphoViewer} ref={refCanvas}>
                MorphologyViewer
            </canvas>
            <Settings painter={morphoCanvas} />
            <button
                className={styles.fullscreenButton}
                type="button"
                onClick={handleFullscreen}
                aria-label="Toggle fullscreen"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>fullscreen</title>
                    <path
                        fill="currentColor"
                        d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z"
                    />
                </svg>
            </button>
            <div className={styles.rightPanel}>
                <canvas
                    className={styles.gizmo}
                    ref={canvas => {
                        gizmoCanvas.canvas = canvas
                    }}
                >
                    GizmoViewer
                </canvas>
                <ColorRamp painter={morphoCanvas} />
            </div>
            <Scalebar painter={morphoCanvas} />
            <Warning visible={warning} />
        </div>
    )
}
