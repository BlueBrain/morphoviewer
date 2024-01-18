export function createFramebuffer(gl: WebGL2RenderingContext) {
    const fb = gl.createFramebuffer()
    if (!fb) throw Error("Unable to create a WebGL2 Framebuffer!")

    return fb
}
