import { TgdEvent } from "@tgd/event"

export interface TgdInputPointerEvent {
    x: number
    y: number
    t: number
    fingersCount: number
}

export interface TgdInputPointer {
    readonly eventMoveStart: TgdEvent<{ start: TgdInputPointerEvent }>

    readonly eventMove: TgdEvent<{
        current: TgdInputPointerEvent
        previous: TgdInputPointerEvent
        start: TgdInputPointerEvent
    }>

    readonly eventMoveEnd: TgdEvent<{
        current: TgdInputPointerEvent
        previous: TgdInputPointerEvent
        start: TgdInputPointerEvent
    }>

    readonly eventZoom: TgdEvent<{
        current: TgdInputPointerEvent
        direction: number
        preventDefault: () => void
    }>

    /**
     * Inertia is the time during which we pretend the pointer
     * is still moving, but at decreasing speed.
     */
    inertia: number
}
