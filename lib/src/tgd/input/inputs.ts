import { TgdInputKeyboardImpl } from "@tgd/input/keyboard"
import { TgdInputPointerImpl } from "@tgd/input/pointer"
import { TgdInputKeyboard } from "@tgd/types/input-keyboard"
import { TgdInputPointer } from "@tgd/types/input-pointer"

export class TgdInputs {
    private _keyboard: TgdInputKeyboard | null = null
    private _pointer: TgdInputPointer | null = null

    constructor(private readonly canvas: HTMLCanvasElement) {}

    get keyboard(): TgdInputKeyboard {
        if (!this._keyboard) {
            this._keyboard = new TgdInputKeyboardImpl()
        }
        return this._keyboard
    }

    get pointer(): TgdInputPointer {
        if (!this._pointer) {
            this._pointer = new TgdInputPointerImpl(this.canvas)
        }
        return this._pointer
    }
}
