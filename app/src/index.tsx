import { createRoot } from "react-dom/client"

import { App } from "./App"

// const FILE = "./test.swc"
const FILE = "./GolgiCell.swc"
// const FILE = "./no-axon.swc"

async function start() {
    const root = document.getElementById("root")
    if (!root) throw Error(`Missing element with id "root"!`)

    const response = await fetch(FILE)
    const content = await response.text()
    createRoot(root).render(<App swc={content} />)
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
