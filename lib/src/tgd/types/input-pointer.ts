import { TgdEvent } from "@tgd/event"

export interface TgdInputPointerFingerEvent {
    x: number
    y: number
    t: number
    fingersCount: number
}

export interface TgdInputPointerMoveEvent {
    current: TgdInputPointerFingerEvent
    previous: TgdInputPointerFingerEvent
    start: TgdInputPointerFingerEvent
    altKey: boolean
    ctrlKey: boolean
    shiftKey: boolean
}

export interface TgdInputPointer {
    readonly eventMoveStart: TgdEvent<TgdInputPointerMoveEvent>

    readonly eventMove: TgdEvent<TgdInputPointerMoveEvent>

    readonly eventMoveEnd: TgdEvent<TgdInputPointerMoveEvent>

    readonly eventZoom: TgdEvent<{
        current: TgdInputPointerFingerEvent
        direction: number
        preventDefault: () => void
    }>

    /**
     * Inertia is the time during which we pretend the pointer
     * is still moving, but at decreasing speed.
     */
    inertia: number
}
