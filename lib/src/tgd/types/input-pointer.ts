import { TgdEvent } from "@tgd/event"

export interface TgdInputPointerEventFinger {
    x: number
    y: number
    t: number
    fingersCount: number
}

export interface TgdInputPointerModifierKeys {
    altKey: boolean
    ctrlKey: boolean
    metaKey: boolean
    shiftKey: boolean
}

export interface TgdInputPointerEventZoom extends TgdInputPointerModifierKeys {
    current: TgdInputPointerEventFinger
    direction: number
    preventDefault: () => void
}

export interface TgdInputPointerEventTap extends TgdInputPointerModifierKeys {
    x: number
    y: number
    t: number
    fingersCount: number
}

export interface TgdInputPointerEventMove extends TgdInputPointerModifierKeys {
    current: TgdInputPointerEventFinger
    previous: TgdInputPointerEventFinger
    start: TgdInputPointerEventFinger
}

export interface TgdInputPointer {
    readonly eventTap: TgdEvent<Readonly<TgdInputPointerEventTap>>

    readonly eventMoveStart: TgdEvent<Readonly<TgdInputPointerEventMove>>

    readonly eventMove: TgdEvent<Readonly<TgdInputPointerEventMove>>

    readonly eventMoveEnd: TgdEvent<Readonly<TgdInputPointerEventMove>>

    readonly eventZoom: TgdEvent<Readonly<TgdInputPointerEventZoom>>

    /**
     * This is a tap only of the pointer touched for less that
     * `tapDelay` milliseconds.
     */
    tapDelay: number
}
