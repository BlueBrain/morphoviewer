import { TgdCamera } from "@tgd/camera"
import { TgdQuat, TgdVec3 } from "@tgd/math"
import { mix } from "../math"

interface CameraTarget {
    spaceHeightAtTarget: number
    distance: number
    zoom: number
    orientation: TgdQuat
    target: TgdVec3
    shift: TgdVec3
}

export function tgdActionCreateCameraInterpolation(
    camera: TgdCamera,
    destination: Partial<CameraTarget>
) {
    const beginSpaceHeightAtTarget = camera.spaceHeightAtTarget
    const beginDistance = camera.distance
    const beginZoom = camera.zoom
    const beginOrientation = new TgdQuat(camera.orientation)
    const beginTarget = new TgdVec3(camera.target)
    const beginShift = new TgdVec3(camera.shift)
    const endSpaceHeightAtTarget =
        destination.spaceHeightAtTarget ?? beginSpaceHeightAtTarget
    const endDistance = destination.distance ?? beginDistance
    const endZoom = destination.zoom ?? beginZoom
    const endOrientation = new TgdQuat(
        destination.orientation ?? beginOrientation
    )
    const endTarget = new TgdVec3(destination.target ?? beginTarget)
    const endShift = new TgdVec3(destination.shift ?? beginShift)
    const orientation = new TgdQuat()
    const target = new TgdVec3()
    const shift = new TgdVec3()
    return (t: number) => {
        camera.spaceHeightAtTarget = mix(
            beginSpaceHeightAtTarget,
            endSpaceHeightAtTarget,
            t
        )
        camera.distance = mix(beginDistance, endDistance, t)
        camera.zoom = mix(beginZoom, endZoom, t)
        camera.orientation = orientation
            .fromSlerp(beginOrientation, endOrientation, t)
            .normalize()
        camera.target = target.fromMix(beginTarget, endTarget, t)
        camera.shift = shift.fromMix(beginShift, endShift, t)
    }
}
