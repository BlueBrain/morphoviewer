import { mat3, mat4, vec3 } from "gl-matrix"
import { Wgl2Camera } from "./camera"
import { Wgl2DirtyScalar } from "../dirty/scalar"

const X = vec3.fromValues(1, 0, 0)
const Y = vec3.fromValues(0, 1, 0)
const Z = vec3.fromValues(0, 0, 1)

export class Wgl2CameraOrthographic extends Wgl2Camera {
    public readonly height: Wgl2DirtyScalar

    constructor() {
        super()
        this.height = new Wgl2DirtyScalar(this.handleDirty)
    }

    protected updateProjection() {
        const ratio = this.viewport.width / this.viewport.height
        const h = this.zoom.get() * this.height.get()
        const w = ratio * h
        const near = this.near.get()
        const far = this.far.get()
        const depth = far - near
        // prettier-ignore
        mat4.set(this.matrixProjection, 
            2 / w, 0, 0, 0,
            0, 2 / h, 0, 0,
            0, 0, -2 / depth, 0,
            0, 0, -2 / (far + near), 1
        )
        // mat4.ortho(
        //     this.matrixProjection,
        //     -h * ratio,
        //     h * ratio,
        //     -h,
        //     h,
        //     this.near.get(),
        //     this.far.get()
        // )
    }

    protected updateView(): void {
        const near = this.near.get()
        const far = this.far.get()
        const depth = Math.abs(far - near)
        mat3.fromQuat(this.axis, this.orientation)
        vec3.transformMat3(this.axisX, X, this.axis)
        vec3.transformMat3(this.axisY, Y, this.axis)
        vec3.transformMat3(this.axisZ, Z, this.axis)
        vec3.scaleAndAdd(
            this.position,
            this.target.asVec3(),
            this.axisZ,
            0.25 * depth + near
        )
        mat4.lookAt(
            this.matrixView,
            this.position,
            this.target.asArray(),
            this.axisY
        )
        console.log("🚀 [camera-orthographic] this.position = ", this.position) // @FIXME: Remove this line written on 2023-12-19 at 16:03
        console.log(
            "🚀 [camera-orthographic] this.target.asArray() = ",
            this.target.asArray()
        ) // @FIXME: Remove this line written on 2023-12-19 at 16:04
    }
}
