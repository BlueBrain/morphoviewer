export type WebglWrap = "REPEAT" | "CLAMP_TO_EDGE" | "MIRRORED_REPEAT"

export type WebglMinFilter =
    | "LINEAR"
    | "NEAREST"
    | "NEAREST_MIPMAP_NEAREST"
    | "LINEAR_MIPMAP_NEAREST"
    | "NEAREST_MIPMAP_LINEAR"
    | "LINEAR_MIPMAP_LINEAR"

export type WebglMagFilter = "LINEAR" | "NEAREST"

/** POINTS, LINE_STRIP, LINE_LOOP, LINES, TRIANGLE_FAN, TRIANGLE_STRIP or TRIANGLES. */
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

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export type WebglPixelStoreFormat =
    | "RGB"
    | "RGBA"
    | "LUMINANCE_ALPHA"
    | "ALPHA"
    | "LUMINANCE"

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getTexParameter
 */
export type WebglTexParameter =
    | "TEXTURE_MAG_FILTER"
    | "TEXTURE_MIN_FILTER"
    | "TEXTURE_WRAP_S"
    | "TEXTURE_WRAP_T"
    | "TEXTURE_BASE_LEVEL"
    | "TEXTURE_COMPARE_FUNC"
    | "TEXTURE_COMPARE_MODE"
    | "TEXTURE_IMMUTABLE_FORMAT"
    | "TEXTURE_IMMUTABLE_LEVELS"
    | "TEXTURE_MAX_LEVEL"
    | "TEXTURE_MAX_LOD"
    | "TEXTURE_MIN_LOD"
    | "TEXTURE_WRAP_R"

export type WebglUniformType =
    | "sampler2D"
    | "sampler2DArray"
    | "sampler3D"
    | "samplerCube"
    | "bool"
    | "int"
    | "uint"
    | "float"
    | "double"
    | "vec2"
    | "bvec2"
    | "ivec2"
    | "uvec2"
    | "dvec2"
    | "vec3"
    | "bvec3"
    | "ivec3"
    | "uvec3"
    | "dvec3"
    | "vec4"
    | "bvec4"
    | "ivec4"
    | "uvec4"
    | "dvec4"
    | "mat2"
    | "mat3"
    | "mat4"

export type WebglAttributeType =
    | "bool"
    | "int"
    | "uint"
    | "float"
    | "double"
    | "vec2"
    | "bvec2"
    | "ivec2"
    | "uvec2"
    | "dvec2"
    | "vec3"
    | "bvec3"
    | "ivec3"
    | "uvec3"
    | "dvec3"
    | "vec4"
    | "bvec4"
    | "ivec4"
    | "uvec4"
    | "dvec4"
    | "mat2"
    | "mat3"
    | "mat4"
