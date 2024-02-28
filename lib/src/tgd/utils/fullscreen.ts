/**
 * Check if an element is in fullscreen or not.
 * @returns `true` if `elem` is displayed in fullscreen.
 */
export function tgdFullscreenTest(elem: Element | null): boolean {
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

/**
 * Request for an element to go fullscreen.
 * @returns `true` in case of success.
 */
export async function tgdFullscreenRequest(
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

/**
 * Exit fullscreen mode.
 * @returns `true` in case of success.
 */
export async function tgdFullscreenExit(): Promise<boolean> {
    if (!document.fullscreenElement) return false

    try {
        await document.exitFullscreen()
        return true
    } catch (ex) {
        return false
    }
}

/**
 * If `element` is not in fullscreen mode, request it.
 * Otherwise, exit from fullscreen mode.
 */
export async function tgdFullscreenToggle(
    element: Element | null,
    options: FullscreenOptions = {
        navigationUI: "hide",
    }
): Promise<boolean> {
    if (!element) return false

    return tgdFullscreenTest(element)
        ? tgdFullscreenExit()
        : tgdFullscreenRequest(element, options)
}
