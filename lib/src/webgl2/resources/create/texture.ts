export interface Wgl2TextureOptions {
    internalFormat: "RGBA" | "LUMINANCE"
    width: number
    height: number
}

export function createTexture(
    gl: WebGL2RenderingContext,
    {
        width = 1,
        height = 1,
        internalFormat = "RGBA",
    }: Partial<Wgl2TextureOptions> = {}
): WebGLTexture {
    const texture = gl.createTexture()
    if (!texture) throw Error("Unable to create a WebGL2 Texture!")

    // Tell GL that the current texture is this one.
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // The texture doesn't wrap and it uses linear interpolation.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    // Set texture dimension.
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl[internalFormat],
        width,
        height,
        0,
        gl[internalFormat],
        gl.UNSIGNED_BYTE,
        null
    )
    return texture
}
