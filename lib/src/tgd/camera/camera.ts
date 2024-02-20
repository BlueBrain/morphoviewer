import { TgdQuat, TgdVec3, TgdMat4, TgdVec4, TgdQuatFace } from "@tgd/math"
import { TgdMat3 } from "@tgd/math/mat3"

export abstract class TgdCamera {
    protected dirtyProjection = true

    private _screenWidth = 1920
    private _screenHeight = 1080
    private _screenAspectRatio = 1920 / 1080

    /** Do we need recalculation? */
    private dirty = true
    private dirtyAxis = true
    private readonly axisX = new TgdVec3()
    private readonly axisY = new TgdVec3()
    private readonly axisZ = new TgdVec3()
    // transformation
    private readonly _matrixViewModel = new TgdMat4()
    private readonly orientation = new TgdQuat(0, 0, 0, 1)
    private readonly target = new TgdVec3(0, 0, 0)
    private _distance = 10
    private _zoom = 1
    // For fast calculations (we don't want to recreate them).
    private readonly tmpMat3 = new TgdMat3()
    private readonly tmpVec3 = new TgdVec3()

    constructor() {
        this.face("+X+Y+Z")
    }

    get screenAspectRatio() {
        return this._screenAspectRatio
    }

    get screenWidth() {
        return this._screenWidth
    }
    set screenWidth(v: number) {
        if (v === this._screenWidth) return

        this._screenWidth = v
        this.dirtyProjection = true
        this._screenAspectRatio = this._screenWidth / this._screenHeight
    }

    get screenHeight() {
        return this._screenHeight
    }
    set screenHeight(v: number) {
        if (v === this._screenHeight) return

        this._screenHeight = v
        this.dirtyProjection = true
        this._screenAspectRatio = this._screenWidth / this._screenHeight
    }

    face(face: TgdQuatFace) {
        this.orientation.face(face)
        this.dirty = true
        this.dirtyAxis = true
    }

    from(camera: TgdCamera): this {
        const {
            orientation,
            target,
            distance,
            zoom,
            screenWidth,
            screenHeight,
        } = camera
        this.orientation.from(orientation)
        this.target.from(target)
        this.distance = distance
        this.zoom = zoom
        this.screenWidth = screenWidth
        this.screenHeight = screenHeight
        this.dirty = true
        this.dirtyAxis = true
        this.copyProjectionFrom(camera)
        return this
    }

    abstract copyProjectionFrom(camera: TgdCamera): this

    /**
     * Copy the orientation from another camera.
     */
    copyOrientationFrom({ orientation }: TgdCamera) {
        this.setOrientation(orientation)
    }

    toAxisX(axisX: TgdVec3): this {
        this.updateAxisIfNeeded()
        axisX.from(this.axisX)
        return this
    }

    toAxisY(axisY: TgdVec3): this {
        this.updateAxisIfNeeded()
        axisY.from(this.axisY)
        return this
    }

    toAxisZ(axisZ: TgdVec3): this {
        this.updateAxisIfNeeded()
        axisZ.from(this.axisZ)
        return this
    }

    get matrixViewModel(): TgdMat4 {
        this.updateIfNeeded()
        return this._matrixViewModel
    }

    abstract get matrixProjection(): TgdMat4

    setOrientation(quat: TgdQuat) {
        const { orientation } = this
        if (quat.isEqual(orientation)) return

        const [x, y, z, w] = quat
        orientation.x = x
        orientation.y = y
        orientation.z = z
        orientation.w = w
        this.dirty = true
        this.dirtyAxis = true
    }

    setTarget(vec: TgdVec3) {
        const { target } = this
        if (vec.isEqual(target)) return

        const [x, y, z] = vec
        target.x = x
        target.y = y
        target.z = z
        this.dirty = true
    }

    get x() {
        return this.target.x
    }
    set x(v: number) {
        const { target } = this
        if (v === target.x) return

        target.x = v
        this.dirty = true
    }

    get y() {
        return this.target.y
    }
    set y(v: number) {
        const { target } = this
        if (v === target.y) return

        target.y = v
        this.dirty = true
    }

    get z() {
        return this.target.z
    }
    set z(v: number) {
        const { target } = this
        if (v === target.z) return

        target.z = v
        this.dirty = true
    }

    get distance() {
        return this._distance
    }
    set distance(v: number) {
        if (this._distance === v) return

        this._distance = v
        this.dirty = true
    }

    get zoom() {
        return this._zoom
    }
    set zoom(v: number) {
        if (this._zoom === v) return

        this._zoom = v
        this.dirty = true
    }

    /**
     * Add (x,y,z) to the target coords in Camera space.
     * That means we are moving along the camera axis.
     */
    moveTarget(x: number, y: number, z: number) {
        const { target } = this
        this.updateAxisIfNeeded()
        const { axisX, axisY, axisZ, tmpVec3 } = this
        tmpVec3
            .from(axisX)
            .scale(x)
            .addWithScale(axisY, y)
            .addWithScale(axisZ, z)
        target.x += tmpVec3.x
        target.y += tmpVec3.y
        target.z += tmpVec3.z
        this.dirty = true
    }

    orbitAroundX(angleInRadians: number): this {
        this.updateAxisIfNeeded()
        const { axisX, axisY, axisZ, orientation } = this
        axisY.rotateAround(axisX, angleInRadians)
        axisZ.rotateAround(axisX, angleInRadians)
        orientation.fromAxis(axisX, axisY, axisZ)
        this.dirty = true
        return this
    }

    orbitAroundY(angleInRadians: number): this {
        this.updateAxisIfNeeded()
        const { axisX, axisY, axisZ, orientation } = this
        axisX.rotateAround(axisY, angleInRadians)
        axisZ.rotateAround(axisY, angleInRadians)
        orientation.fromAxis(axisX, axisY, axisZ)
        this.dirty = true
        return this
    }

    orbitAroundZ(angleInRadians: number): this {
        this.updateAxisIfNeeded()
        const { axisX, axisY, axisZ, orientation } = this
        axisX.rotateAround(axisZ, angleInRadians)
        axisY.rotateAround(axisZ, angleInRadians)
        orientation.fromAxis(axisX, axisY, axisZ)
        this.dirty = true
        return this
    }

    debug(caption = "Camera") {
        this.orientation.debug(`${caption} quaternion:`)
    }

    private updateAxisIfNeeded() {
        if (this.dirtyAxis) this.updateAxis()
    }

    private updateAxis() {
        const { tmpMat3 } = this
        tmpMat3.fromQuat(this.orientation)
        tmpMat3.toAxis(this.axisX, this.axisY, this.axisZ)
        this.dirtyAxis = false

        if (
            Math.abs(1 - this.axisX.size) > 0.1 ||
            Math.abs(1 - this.axisY.size) > 0.1 ||
            Math.abs(1 - this.axisZ.size) > 0.1
        ) {
            this.axisX.debug("Axis X")
            this.axisY.debug("Axis Y")
            this.axisZ.debug("Axis Z")
            throw Error("STOP!")
        }
    }

    private updateIfNeeded(): void {
        if (!this.dirty) return

        const { tmpMat3, tmpVec3 } = this
        const mat = this._matrixViewModel
        this.updateAxis()
        const d = this._distance
        const { x: tx, y: ty, z: tz } = this.target
        const { x: ax, y: ay, z: az } = this.axisZ
        tmpVec3.x = tx + d * ax
        tmpVec3.y = ty + d * ay
        tmpVec3.z = tz + d * az
        tmpVec3.applyMatrix(tmpMat3.transpose()).scale(-1 / this.zoom)
        mat.m30 = tmpVec3.x
        mat.m31 = tmpVec3.y
        mat.m32 = tmpVec3.z
        const zoom = this._zoom
        if (zoom !== 1) tmpMat3.scale(zoom)
        mat.fromMat3(tmpMat3)
        this.dirty = false
    }
}
