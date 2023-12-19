import { Wgl2Resources } from "./webgl2/resources/resources"
export default class Colors {
    private _soma = "#444"
    private _axon = "#00f"
    private _apicalDendrite = "#f0f"
    private _basalDendrite = "#f00"
    private _unknown = "#888"

    constructor(private readonly onChange: (colors: Colors) => void) {}

    get soma() {
        return this._soma
    }
    set soma(value: string) {
        if (value === this._soma) return

        this._soma = value
        this.fire()
    }

    get axon() {
        return this._axon
    }
    set axon(value: string) {
        if (value === this._axon) return

        this._axon = value
        this.fire()
    }

    get apicalDendrite() {
        return this._apicalDendrite
    }
    set apicalDendrite(value: string) {
        if (value === this._apicalDendrite) return

        this._apicalDendrite = value
        this.fire()
    }

    get basalDendrite() {
        return this._basalDendrite
    }
    set basalDendrite(value: string) {
        if (value === this._basalDendrite) return

        this._basalDendrite = value
        this.fire()
    }

    get unknown() {
        return this._unknown
    }
    set unknown(value: string) {
        if (value === this._unknown) return

        this._unknown = value
        this.fire()
    }

    private fire() {
        this.onChange(this)
    }
}
