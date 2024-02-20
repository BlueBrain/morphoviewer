import { TgdEvent } from "../event"

export interface TgdInputKeyboard {
    readonly eventKeyPress: TgdEvent<KeyboardEvent>
    isDown(...keys: string[]): boolean
    isUp(...keys: string[]): boolean
    hasClicked(key: string): boolean
}
