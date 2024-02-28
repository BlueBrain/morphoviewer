import { createFramebuffer } from "../resources/create/frame-buffer"
import { Wgl2TextureOptions, createTexture } from "../resources/create/texture"

export interface Wgl2FactoryFrameBufferOptions extends Wgl2TextureOptions {
    depthBuffer: boolean
}

export class Wgl2FactoryFrameBuffer {
    private width = 0
    private height = 0
    private texture: WebGLTexture | null = null
    private framebuffer: WebGLFramebuffer | null = null
    private depthBuffer: WebGLRenderbuffer | null = null

    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly options: Partial<Wgl2FactoryFrameBufferOptions>
    ) {}

    getTexture(): WebGLTexture {
        this.createIfNeeded()
        const { texture } = this
        if (!texture) throw Error("Unable to create a texture for framebuffer!")

        return texture
    }

    getFramebuffer(): WebGLFramebuffer {
        this.createIfNeeded()
        const { framebuffer } = this
        if (!framebuffer) throw Error("Unable to create a framebuffer!")

        return framebuffer
    }

    bindFramebuffer() {
        const { gl } = this
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.getFramebuffer())
    }

    unbindFramebuffer() {
        const { gl } = this
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    cleanUp() {
        const { gl, texture, framebuffer, depthBuffer } = this
        if (texture) {
            gl.deleteTexture(texture)
            this.texture = null
        }
        if (framebuffer) {
            gl.deleteFramebuffer(framebuffer)
            this.framebuffer = null
        }
        if (depthBuffer) {
            gl.deleteRenderbuffer(depthBuffer)
            this.depthBuffer = null
        }
    }

    private createIfNeeded() {
        const { gl, options } = this
        const width = gl.drawingBufferWidth
        const height = gl.drawingBufferHeight
        if (this.width !== width || this.height !== height) this.cleanUp()

        this.width = width
        this.height = height
        if (!this.texture) {
            this.texture = createTexture(gl, {
                ...this.options,
                width,
                height,
            })
        }
        if (!this.framebuffer) {
            this.framebuffer = createFramebuffer(gl)
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                this.texture,
                0
            )
            if (options.depthBuffer === true) {
                // Create a Depth Buffer, because the default framebuffer has none.
                const depthBuffer = gl.createRenderbuffer()
                if (!depthBuffer)
                    throw Error("Unable to create WebGLRenderBuffer!")

                this.depthBuffer = depthBuffer
                gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
                gl.renderbufferStorage(
                    gl.RENDERBUFFER,
                    gl.DEPTH_COMPONENT16,
                    width,
                    height
                )
                gl.framebufferRenderbuffer(
                    gl.FRAMEBUFFER,
                    gl.DEPTH_ATTACHMENT,
                    gl.RENDERBUFFER,
                    depthBuffer
                )
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        }
    }
}
