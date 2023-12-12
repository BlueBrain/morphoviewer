import React from "react"

import { MorphologyViewer } from "@/MorphologyViewer"

import styles from "./app.module.css"

interface AppProps {
    swc: string
}

export function App({ swc }: AppProps) {
    return (
        <div className={styles.main}>
            <MorphologyViewer swc={swc} />
        </div>
    )
}
