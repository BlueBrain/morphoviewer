export async function toggleFullscreen(
    element: Element | null,
    options: FullscreenOptions = {
        navigationUI: "hide",
    }
): Promise<boolean> {
    if (!element) return false

    return isFullScreen(element)
        ? exitFullscreen()
        : requestFullscreen(element, options)
}

export async function requestFullscreen(
    element: Element | null,
    options: FullscreenOptions = {
        navigationUI: "hide",
    }
): Promise<boolean> {
    if (!element) return false

    try {
        await element.requestFullscreen(options)
        return true
    } catch (ex) {
        return false
    }
}

export async function exitFullscreen(): Promise<boolean> {
    if (!document.fullscreenElement) return false

    try {
        await document.exitFullscreen()
        return true
    } catch (ex) {
        return false
    }
}

export function isFullScreen(elem: Element | null): boolean {
    const root = document.fullscreenElement
    if (!elem || !root) return false

    let parent = elem.parentElement
    while (parent) {
        if (parent === document.fullscreenElement) {
            return (
                root.clientWidth === elem.clientWidth &&
                root.clientHeight === elem.clientHeight
            )
        }
        parent = parent.parentElement
    }
    return document.fullscreenElement === elem
}
