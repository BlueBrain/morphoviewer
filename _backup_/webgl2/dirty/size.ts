export class Wgl2DirtySize {
    private _width = 0
    private _height = 0

    constructor(
        private readonly onChange: (me: Wgl2DirtySize) => void,
        width = 0,
        height = 0
    ) {
        this._width = width
        this._height = height
    }

    get width() {
        return this._width
    }
    set width(value: number) {
        if (value === this._width) return
        this._width = value
        this.onChange(this)
    }
    get height() {
        return this._height
    }
    set height(value: number) {
        if (value === this._height) return
        this._height = value
        this.onChange(this)
    }
}
