import { Wgl2DirtyScalar } from "./../dirty/scalar"
import { Wgl2DirtySize } from "../dirty/size"
import { Wgl2DirtyVector3 } from "../dirty/vector3"
import { ReadonlyVec3, mat3, mat4, quat, vec3 } from "gl-matrix"

const X = vec3.fromValues(1, 0, 0)
const Y = vec3.fromValues(0, 1, 0)
const Z = vec3.fromValues(0, 0, 1)

export class Wgl2Camera {
    private dirty = true
    private readonly matrixView = mat4.create()
    private readonly matrixProjection = mat4.create()
    private readonly orientation = quat.create()
    private readonly axis = mat3.create()
    private readonly axisX = vec3.create()
    private readonly axisY = vec3.create()
    private readonly axisZ = vec3.create()
    private readonly position = vec3.create()
    private readonly listeners = new Set<() => void>()

    public readonly target: Wgl2DirtyVector3
    public readonly near: Wgl2DirtyScalar
    public readonly far: Wgl2DirtyScalar
    public readonly distance: Wgl2DirtyScalar
    public readonly viewport: Wgl2DirtySize

    constructor() {
        this.distance = new Wgl2DirtyScalar(this.handleDirty, 10)
        this.target = new Wgl2DirtyVector3(this.handleDirty, 0, 0, 0)
        this.viewport = new Wgl2DirtySize(this.handleDirty, 1, 1)
        this.near = new Wgl2DirtyScalar(this.handleDirty, 1e-3)
        this.far = new Wgl2DirtyScalar(this.handleDirty, 1e6)
        this.facePosZ()
    }

    addEventListener(type: "change", listener: () => void) {
        this.listeners.add(listener)
    }

    removeEventListener(type: "change", listener: () => void) {
        this.listeners.delete(listener)
    }

    setUniforms(
        gl: WebGL2RenderingContext,
        locationView: WebGLUniformLocation,
        locationProjection: WebGLUniformLocation
    ) {
        const { matrixView, matrixProjection } = this
        this.updateIfDirty()
        gl.uniformMatrix4fv(locationView, false, matrixView)
        gl.uniformMatrix4fv(locationProjection, false, matrixProjection)
    }

    facePosZ() {
        quat.identity(this.orientation)
        this.handleDirty()
    }

    rotateAroundXY(radX: number, radY: number) {
        this.updateIfDirty()
        const { axisX, axisY, axisZ } = this
        rotateVectorAroundAxis(axisY, axisX, radX)
        rotateVectorAroundAxis(axisZ, axisX, radX)
        rotateVectorAroundAxis(axisX, axisY, radY)
        rotateVectorAroundAxis(axisZ, axisY, radY)
        this.axis[0] = axisX[0]
        this.axis[1] = axisX[1]
        this.axis[2] = axisX[2]
        this.axis[3] = axisY[0]
        this.axis[4] = axisY[1]
        this.axis[5] = axisY[2]
        this.axis[6] = axisZ[0]
        this.axis[7] = axisZ[1]
        this.axis[8] = axisZ[2]
        quat.fromMat3(this.orientation, this.axis)
        quat.normalize(this.orientation, this.orientation)
        this.handleDirty()
        console.log(this.orientation.toString())
    }

    private readonly handleDirty = () => {
        this.dirty = true
        this.listeners.forEach(listener => {
            listener()
        })
    }

    private updateIfDirty() {
        if (this.dirty) {
            this.dirty = false
            mat3.fromQuat(this.axis, this.orientation)
            vec3.transformMat3(this.axisX, X, this.axis)
            vec3.transformMat3(this.axisY, Y, this.axis)
            vec3.transformMat3(this.axisZ, Z, this.axis)
            vec3.scaleAndAdd(
                this.position,
                this.target.asVec3(),
                this.axisZ,
                this.distance.get()
            )
            mat4.lookAt(
                this.matrixView,
                this.position,
                this.target.asArray(),
                this.axisY
            )
            mat4.perspective(
                this.matrixProjection,
                Math.PI / 2,
                this.viewport.width / this.viewport.height,
                this.near.get(),
                this.far.get()
            )
        }
    }
}

function rotateVectorAroundAxis(
    vector: vec3,
    axis: ReadonlyVec3,
    angle: number
) {
    const [x, y, z] = axis
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const rotation = mat3.fromValues(
        c + (1 - c) * x * x,
        (1 - c) * x * y + s * z,
        (1 - c) * x * z - s * y,
        (1 - c) * x * y - s * z,
        c + (1 - c) * y * y,
        (1 - c) * y * z + s * x,
        (1 - c) * x * z + s * y,
        (1 - c) * y * z - s * x,
        c + (1 - c) * z * z
    )
    vec3.transformMat3(vector, vector, rotation)
}
