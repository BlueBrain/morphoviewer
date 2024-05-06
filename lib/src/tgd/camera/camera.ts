import { TgdQuat, TgdVec3, TgdMat4, TgdQuatFace } from "@tgd/math"
import { TgdMat3 } from "@tgd/math/mat3"
import { TgdEvent } from "../event"
import { ArrayNumber3, ArrayNumber4 } from ".."

export interface TgdCameraOptions {
    near?: number
    far?: number
    target?: ArrayNumber3 | TgdVec3
    orientation?: ArrayNumber4 | TgdQuat
    distance?: number
    name?: string
    zoom?: number
}

export abstract class TgdCamera {
    private static incrementalId = 1

    /**
     * A change in the position/orientation/size of the camera.
     */
    public readonly eventTransformChange = new TgdEvent<TgdCamera>()
    public readonly name: string

    private _screenWidth = 1920
    private _screenHeight = 1080
    private _screenAspectRatio = 1920 / 1080

    /** Do we need recalculation? */
    private _dirtyModelView = true
    private dirtyModelViewInverse = true
    private _dirtyAxis = true
    protected _dirtyProjection = true
    protected dirtyProjectionInverse = true

    protected _near = 1e-3
    protected _far = Infinity

    private readonly _axisX = new TgdVec3()
    private readonly _axisY = new TgdVec3()
    private readonly _axisZ = new TgdVec3()
    // transformation
    private readonly _matrixModelView = new TgdMat4()
    private readonly _matrixModelViewInverse = new TgdMat4()
    private readonly _matrixProjectionInverse = new TgdMat4()
    private readonly _orientation = new TgdQuat(0, 0, 0, 1)
    private readonly _shift = new TgdVec3(0, 0, 0)
    private readonly _target = new TgdVec3(0, 0, 0)
    private readonly _position = new TgdVec3(0, 0, 0)
    private _distance = 10
    private _zoom = 1
    // For fast calculations (we don't want to recreate them).
    private readonly tmpMat3 = new TgdMat3()
    private readonly tmpVec3 = new TgdVec3()

    constructor(options: TgdCameraOptions = {}) {
        this.name = options.name ?? `TgdCamera#${TgdCamera.incrementalId++}`
        this._near = options.near ?? 1e-3
        this._far = options.far ?? 1e6
        this._distance = options.distance ?? 10
        this._zoom = options.zoom ?? 1
        const [tx, ty, tz] = options.target ?? [0, 0, 0]
        this.target.reset(tx, ty, tz)
        const [qx, qy, qz, qw] = options.orientation ?? [0, 0, 0, 1]
        this.orientation.reset(qx, qy, qz, qw)
    }

    get near() {
        return this._near
    }
    set near(v: number) {
        if (v === this._near) return

        this._near = v
        this.dirtyProjection = true
    }

    get far() {
        return this._far
    }
    set far(v: number) {
        if (v === this._far) return

        this._far = v
        this.dirtyProjection = true
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

    get spaceHeightAtTarget(): number {
        return this.getSpaceHeightAtTarget()
    }
    set spaceHeightAtTarget(v: number) {
        this.setSpaceHeightAtTarget(v)
    }

    get spaceWidthAtTarget(): number {
        return (this.screenWidth * this.spaceHeightAtTarget) / this.screenHeight
    }
    set spaceWidthAtTarget(v: number) {
        this.setSpaceHeightAtTarget((v * this.screenHeight) / this.screenWidth)
    }

    face(face: TgdQuatFace) {
        this._orientation.face(face)
        this.dirtyModelView = true
        this.dirtyAxis = true
    }

    from(camera: TgdCamera): this {
        const {
            _orientation: orientation,
            _target: target,
            distance,
            zoom,
            screenWidth,
            screenHeight,
        } = camera
        this._orientation.from(orientation)
        this._target.from(target)
        this.distance = distance
        this.zoom = zoom
        this.screenWidth = screenWidth
        this.screenHeight = screenHeight
        this.dirtyModelView = true
        this.dirtyAxis = true
        this.copyProjectionFrom(camera)
        return this
    }

    /**
     * @param screenX -1 is the left edge, 0 id the center and +1 is the right edge.
     * @param screenY -1 is the bottom edge, 0 id the center and +1 is the top edge.
     * @returns The normalized ray vector that goes from the camera position
     * to the point designed on the screen.
     */
    abstract castRay(
        screenX: number,
        screenY: number
    ): Readonly<{
        origin: TgdVec3
        direction: TgdVec3
    }>

    abstract copyProjectionFrom(camera: TgdCamera): this

    get axisX(): Readonly<TgdVec3> {
        this.updateAxisIfNeeded()
        return this._axisX
    }

    get axisY(): Readonly<TgdVec3> {
        this.updateAxisIfNeeded()
        return this._axisY
    }

    get axisZ(): Readonly<TgdVec3> {
        this.updateAxisIfNeeded()
        return this._axisZ
    }

    get matrixModelView(): Readonly<TgdMat4> {
        this.updateIfNeeded()
        return this._matrixModelView
    }

    get matrixModelViewInverse(): Readonly<TgdMat4> {
        if (this.dirtyModelViewInverse) {
            this._matrixModelViewInverse.invert(this.matrixModelView)
            this.dirtyModelViewInverse = false
        }
        return this._matrixModelViewInverse
    }

    abstract get matrixProjection(): Readonly<TgdMat4>

    get matrixProjectionInverse(): Readonly<TgdMat4> {
        if (this.dirtyProjectionInverse) {
            this._matrixProjectionInverse.invert(this.matrixProjection)
            this.dirtyProjectionInverse = false
        }
        return this._matrixProjectionInverse
    }

    get orientation(): Readonly<TgdQuat> {
        return this._orientation
    }

    set orientation(quat: TgdQuat) {
        const { _orientation } = this
        if (quat.isEqual(_orientation)) return

        const [x, y, z, w] = quat
        _orientation.x = x
        _orientation.y = y
        _orientation.z = z
        _orientation.w = w
        this.dirtyModelView = true
        this.dirtyAxis = true
    }

    setOrientation(x: number, y: number, z: number, w: number): this {
        const { _orientation } = this
        _orientation.x = x
        _orientation.y = y
        _orientation.z = z
        _orientation.w = w
        this.dirtyModelView = true
        this.dirtyAxis = true
        return this
    }

    get position(): Readonly<TgdVec3> {
        this.updateIfNeeded()
        return this._position
    }

    get target(): Readonly<TgdVec3> {
        return this._target
    }
    set target(v: Readonly<TgdVec3 | ArrayNumber3>) {
        this._target.from(v)
        this.dirtyModelView = true
    }

    setTarget(x: number, y: number, z: number): this {
        const { _target } = this
        _target.x = x
        _target.y = y
        _target.z = z
        this.dirtyModelView = true
        return this
    }

    get shift(): Readonly<TgdVec3> {
        return this._shift
    }
    set shift(v: TgdVec3) {
        this._shift.from(v)
        this.dirtyModelView = true
    }

    setShift(x: number, y: number, z: number): this {
        const { _shift } = this
        _shift.x = x
        _shift.y = y
        _shift.z = z
        this.dirtyModelView = true
        return this
    }

    get x() {
        return this._target.x
    }
    set x(v: number) {
        const { _target: target } = this
        if (v === target.x) return

        target.x = v
        this.dirtyModelView = true
    }

    get y() {
        return this._target.y
    }
    set y(v: number) {
        const { _target: target } = this
        if (v === target.y) return

        target.y = v
        this.dirtyModelView = true
    }

    get z() {
        return this._target.z
    }
    set z(v: number) {
        const { _target: target } = this
        if (v === target.z) return

        target.z = v
        this.dirtyModelView = true
    }

    get distance() {
        return this._distance
    }
    set distance(v: number) {
        if (this._distance === v) return

        this._distance = v
        this.dirtyModelView = true
    }

    get zoom() {
        return this._zoom
    }
    set zoom(v: number) {
        if (this._zoom === v) return

        this._zoom = v
        this.dirtyModelView = true
    }

    /**
     * Add (x,y,z) to the target coords in Camera space.
     * That means we are moving along the camera axis.
     */
    moveTarget(x: number, y: number, z: number) {
        const { _target: target } = this
        this.updateAxisIfNeeded()
        const { _axisX: axisX, _axisY: axisY, _axisZ: axisZ, tmpVec3 } = this
        tmpVec3
            .from(axisX)
            .scale(x)
            .addWithScale(axisY, y)
            .addWithScale(axisZ, z)
        target.x += tmpVec3.x
        target.y += tmpVec3.y
        target.z += tmpVec3.z
        this.dirtyModelView = true
    }

    moveShift(x: number, y: number, z: number) {
        const [sx, sy, sz] = this._shift
        this._shift.reset(x + sx, y + sy, z + sz)
        this._dirtyModelView = true
    }

    orbitAroundX(angleInRadians: number): this {
        this.updateAxisIfNeeded()
        const {
            _axisX: axisX,
            _axisY: axisY,
            _axisZ: axisZ,
            _orientation: orientation,
        } = this
        axisY.rotateAround(axisX, angleInRadians)
        axisZ.rotateAround(axisX, angleInRadians)
        orientation.fromAxis(axisX, axisY, axisZ)
        this.dirtyModelView = true
        return this
    }

    orbitAroundY(angleInRadians: number): this {
        this.updateAxisIfNeeded()
        const {
            _axisX: axisX,
            _axisY: axisY,
            _axisZ: axisZ,
            _orientation: orientation,
        } = this
        axisX.rotateAround(axisY, angleInRadians)
        axisZ.rotateAround(axisY, angleInRadians)
        orientation.fromAxis(axisX, axisY, axisZ)
        this.dirtyModelView = true
        return this
    }

    orbitAroundZ(angleInRadians: number): this {
        this.updateAxisIfNeeded()
        const {
            _axisX: axisX,
            _axisY: axisY,
            _axisZ: axisZ,
            _orientation: orientation,
        } = this
        axisX.rotateAround(axisZ, angleInRadians)
        axisY.rotateAround(axisZ, angleInRadians)
        orientation.fromAxis(axisX, axisY, axisZ)
        this.dirtyModelView = true
        return this
    }

    debug(caption?: string) {
        this._orientation.debug(`${caption ?? this.name} quaternion:`)
    }

    protected abstract getSpaceHeightAtTarget(): number

    protected abstract setSpaceHeightAtTarget(v: number): void

    private updateAxisIfNeeded() {
        if (this.dirtyAxis) this.updateAxis()
    }

    private updateAxis() {
        const { tmpMat3 } = this
        tmpMat3.fromQuat(this._orientation)
        tmpMat3.toAxis(this._axisX, this._axisY, this._axisZ)
        this.dirtyAxis = false
    }

    private updateIfNeeded(): void {
        if (!this.dirtyModelView) return

        const { tmpMat3, tmpVec3, _position } = this
        const mat = this._matrixModelView
        this.updateAxis()
        const d = this._distance
        const { x: sx, y: sy, z: sz } = this._shift
        const { x: tx, y: ty, z: tz } = this._target
        const { x: ax, y: ay, z: az } = this._axisZ
        _position.x = tx + d * ax
        _position.y = ty + d * ay
        _position.z = tz + d * az
        _position.addWithScale(this._axisX, sx)
        _position.addWithScale(this._axisY, sy)
        _position.addWithScale(this._axisZ, sz)
        tmpVec3.from(_position).applyMatrix(tmpMat3.transpose()).scale(-1)
        mat.m30 = tmpVec3.x
        mat.m31 = tmpVec3.y
        mat.m32 = tmpVec3.z
        mat.fromMat3(tmpMat3)
        this.dirtyModelView = false
    }

    private get dirtyModelView(): boolean {
        return this._dirtyModelView
    }
    private set dirtyModelView(v: boolean) {
        this._dirtyModelView = v
        if (v) {
            this.dirtyModelViewInverse = true
            this.eventTransformChange.dispatch(this)
        }
    }

    private get dirtyAxis(): boolean {
        return this._dirtyAxis
    }
    private set dirtyAxis(v: boolean) {
        this._dirtyAxis = v
    }

    protected get dirtyProjection(): boolean {
        return this._dirtyProjection
    }
    protected set dirtyProjection(v: boolean) {
        this._dirtyProjection = v
        if (v) this.dirtyProjectionInverse = true
    }
}
