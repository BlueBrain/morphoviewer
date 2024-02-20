export type WebglWrap = "REPEAT" | "CLAMP_TO_EDGE" | "MIRRORED_REPEAT"

export type WebglMinFilter =
    | "LINEAR"
    | "NEAREST"
    | "NEAREST_MIPMAP_NEAREST"
    | "LINEAR_MIPMAP_NEAREST"
    | "NEAREST_MIPMAP_LINEAR"
    | "LINEAR_MIPMAP_LINEAR"

export type WebglMagFilter = "LINEAR" | "NEAREST"

export type WebglDrawMode =
    | "POINTS"
    | "LINE_STRIP"
    | "LINE_LOOP"
    | "LINES"
    | "TRIANGLE_STRIP"
    | "TRIANGLE_FAN"
    | "TRIANGLES"

export type WebglImage =
    | ImageData
    | HTMLImageElement
    | HTMLCanvasElement
    | HTMLVideoElement
    | ImageBitmap

export type WebglDepthFunc =
    /** never pass */
    | "NEVER"
    /** pass if the incoming value is less than the depth buffer value */
    | "LESS"
    /** pass if the incoming value equals the depth buffer value */
    | "EQUAL"
    /** pass if the incoming value is less than or equal to the depth buffer value */
    | "LEQUAL"
    /** pass if the incoming value is greater than the depth buffer value */
    | "GREATER"
    /** pass if the incoming value is not equal to the depth buffer value */
    | "NOTEQUAL"
    /** pass if the incoming value is greater than or equal to the depth buffer value */
    | "GEQUAL"
    /** always pass */
    | "ALWAYS"
