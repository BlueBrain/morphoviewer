import { TgdContext } from "../context"
import { TgdTexture2D, TgdTexture2DOptions } from "../types"
import { TgdPainterGroup } from "./group"

export interface TgdPainterFramebufferOptions extends TgdTexture2DOptions {
    /**
     * Do we need a depth buffer?
     */
    depthBuffer: boolean
    /**
     * If defined, the framebuffer will automatically match the
     * current viewport size multiplied by `viewportMatchingScale`.
     *
     * for instance, if `viewportMatchingScale === 0.5` and the viewport
     * id (640, 480), then the framebuffer will have a size of
     * (320, 240).
     */
    viewportMatchingScale?: number
}

export class TgdPainterFramebuffer extends TgdPainterGroup {
    private dirty = true
    private _width = 0
    private _height = 0
    private _texture: TgdTexture2D | null = null
    private _framebuffer: WebGLFramebuffer | null = null
    private _depthBuffer: WebGLRenderbuffer | null = null

    constructor(
        private readonly context: TgdContext,
        private readonly options: Partial<TgdPainterFramebufferOptions>
    ) {
        super()
        this._width = options.width ?? 0
        this._height = options.height ?? 0
    }

    get texture(): TgdTexture2D {
        if (!this._texture) {
            this._texture = this.context.textures2D.getDefaultEmpty()
        }
        return this._texture
    }

    get width(): number {
        return this._width
    }
    set width(v: number) {
        if (this._width === v) return

        this._width = v
        this.dirty = true
    }

    get height(): number {
        return this._height
    }
    set height(v: number) {
        if (this._height === v) return

        this._height = v
        this.dirty = true
    }

    private createFramebufferIfNeeded() {
        if (!this.dirty) return

        const { context, width, height } = this
        const { gl } = context
        this.delete()
        this._texture = context.textures2D.create({
            width: Math.max(width, 1),
            height: Math.max(height, 1),
            internalFormat: "RGB",
            generateMipMap: true,
        })
        this._framebuffer = context.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer)
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this._texture.glTexture,
            0
        )
        if (this.options.depthBuffer === true) {
            // Create a Depth Buffer, because the default
            // framebuffer has none.
            const depthBuffer = gl.createRenderbuffer()
            if (!depthBuffer) throw Error("Unable to create WebGLRenderBuffer!")

            this._depthBuffer = depthBuffer
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
        // const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
        // console.log("Framebuffer status:", context.lookupWebglConstant(status))
        this.dirty = false
    }

    paint(time: number, delay: number): void {
        const { context, options } = this
        const { gl } = context
        const { viewportMatchingScale } = options
        if (typeof viewportMatchingScale === "number") {
            this.width = Math.round(context.width * viewportMatchingScale)
            this.height = Math.round(context.height * viewportMatchingScale)
        }
        this.createFramebufferIfNeeded()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer)
        super.paint(time, delay)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    delete() {
        const { context, _texture, _framebuffer, _depthBuffer } = this
        const { gl } = context
        if (_texture) {
            gl.deleteTexture(_texture.glTexture)
            this._texture = null
        }
        if (_framebuffer) {
            gl.deleteFramebuffer(_framebuffer)
            this._framebuffer = null
        }
        if (_depthBuffer) {
            gl.deleteRenderbuffer(_depthBuffer)
            this._depthBuffer = null
        }
    }
}
