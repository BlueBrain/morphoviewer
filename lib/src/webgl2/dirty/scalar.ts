export class Wgl2DirtyScalar {
    private _value = 0

    constructor(
        private readonly onChange: (me: Wgl2DirtyScalar) => void,
        value = 0
    ) {
        this._value = value
    }

    set(value: number) {
        if (this._value === value) return

        this._value = value
        this.onChange(this)
    }

    get() {
        return this._value
    }
}
