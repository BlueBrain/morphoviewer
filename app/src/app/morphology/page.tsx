import { MorphologyViewer } from "@/MorphologyViewer"
import React from "react"

// const FILE = "./GolgiCell.swc"
const FILE = "./test-2.swc"

export default function PageMorphology() {
    const [swc, setSwc] = React.useState("")
    React.useEffect(() => {
        const action = async () => {
            const response = await fetch(FILE)
            const content = await response.text()
            console.log("SWC file loaded:", content.length, "bytes")
            setSwc(content)
        }
        void action()
    }, [])
    if (!swc) {
        return (
            <div
                style={{
                    display: "grid",
                    placeItems: "center",
                }}
            >
                <h1>Loading SWC file...</h1>
            </div>
        )
    }
    return <MorphologyViewer swc={swc} />
}
