import { createRoot } from "react-dom/client"

import App from "./app"
import { TgdParserGLTransfertFormatBinary } from "@bbp/morphoviewer"

function start() {
    fetch("cube.glb")
        .then(response => response.arrayBuffer())
        .then(data => {
            new TgdParserGLTransfertFormatBinary(data)
        })
        .catch(console.error)

    const root = document.getElementById("root")
    if (!root) throw Error(`Missing element with id "root"!`)

    createRoot(root).render(<App />)
    removeSplash()
}

const SPLASH_SCREEN_VANISHING_TIME_MS = 600

function removeSplash() {
    const splash = document.getElementById("splash-screen")
    if (splash) {
        splash.classList.add("vanish")
        window.setTimeout(
            () => document.body.removeChild(splash),
            SPLASH_SCREEN_VANISHING_TIME_MS
        )
    }
}

void start()
