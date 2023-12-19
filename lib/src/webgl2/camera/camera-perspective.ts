import { mat3, mat4, vec3 } from "gl-matrix"

import { Wgl2DirtyScalar } from "../dirty/scalar"
import { Wgl2Camera } from "./camera"

const X = vec3.fromValues(1, 0, 0)
const Y = vec3.fromValues(0, 1, 0)
const Z = vec3.fromValues(0, 0, 1)

export abstract class Wgl2CameraPerspective extends Wgl2Camera {
    public readonly distance: Wgl2DirtyScalar

    constructor() {
        super()
        this.distance = new Wgl2DirtyScalar(this.handleDirty, 10)
        this.facePosZ()
    }

    protected updateView() {
        mat3.fromQuat(this.axis, this.orientation)
        vec3.transformMat3(this.axisX, X, this.axis)
        vec3.transformMat3(this.axisY, Y, this.axis)
        vec3.transformMat3(this.axisZ, Z, this.axis)
        vec3.scaleAndAdd(
            this.position,
            this.target.asVec3(),
            this.axisZ,
            this.distance.get() * this.zoom.get()
        )
        mat4.lookAt(
            this.matrixView,
            this.position,
            this.target.asArray(),
            this.axisY
        )
    }

    protected updateProjection() {
        mat4.perspective(
            this.matrixProjection,
            Math.PI / 2,
            this.viewport.width / this.viewport.height,
            this.near.get(),
            this.far.get()
        )
    }
}
