import React from "react"

export function useSignal(
    delay: number
): [value: boolean, set: (value: boolean) => void] {
    const refId = React.useRef(0)
    const [signal, setSignal] = React.useState(false)

    return [
        signal,
        (value: boolean) => {
            window.clearTimeout(refId.current)
            setSignal(value)
            if (value) {
                refId.current = window.setTimeout(() => {
                    setSignal(false)
                }, delay)
            }
        },
    ]
}
