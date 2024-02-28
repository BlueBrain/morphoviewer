import { TgdLoaderImage } from "@tgd/loader"
import { TgdEvent } from "@tgd/event/event"
import {
    TgdProgram,
    TgdTexture2D,
    TgdTexture2DOptions,
    TgdContextInterface,
    WebglImage,
} from "@tgd/types"
import { tgdCanvasCreateWithContext2D } from "@tgd/utils"

const DEFAULT_DATA = new Uint8Array([200, 200, 200, 255])

export class TgdTexture2DImpl implements TgdTexture2D {
    public readonly glTexture: WebGLTexture
    public readonly eventImageUpdate = new TgdEvent<TgdTexture2D>()

    private readonly options: TgdTexture2DOptions
    private _width = 0
    private _height = 0
    private _image: null | WebglImage = null

    constructor(
        public readonly context: TgdContextInterface,
        public readonly id: string,
        options: Partial<TgdTexture2DOptions> = {}
    ) {
        const { gl } = context
        this.options = {
            wrapS: "REPEAT",
            wrapT: "REPEAT",
            wrapR: "REPEAT",
            minFilter: "NEAREST_MIPMAP_LINEAR",
            magFilter: "LINEAR",
            data: DEFAULT_DATA,
            width: 1,
            height: 1,
            ...options,
        }
        const texture = gl.createTexture()
        if (!texture) throw Error("Unable to create a WebGLTexture!")

        this.glTexture = texture
        const {
            wrapS,
            wrapT,
            wrapR,
            minFilter,
            magFilter,
            width = 1,
            height = 1,
            data = DEFAULT_DATA,
        } = this.options
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            data
        )

        // The texture doesn't wrap and it uses linear interpolation.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[wrapS])
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[wrapT])
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl[wrapR])
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[minFilter])
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[magFilter])
        if (options.image) this.loadImage(options.image)
    }

    makePalette(colors: string[], colums = 0) {
        const width = colums > 0 ? colums : colors.length
        const height = Math.ceil(colors.length / width)
        const { canvas, ctx } = tgdCanvasCreateWithContext2D(width, height)
        let i = 0
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                ctx.fillStyle = colors[i++]
                ctx.fillRect(x, y, 1, 1)
            }
        }
        this.loadImage(canvas)
    }

    fillHorizontalGradient(size: number, ...colors: string[]): void {
        this.fillGradient(size, 1, 1, 0, ...colors)
    }

    fillverticalGradient(size: number, ...colors: string[]): void {
        this.fillGradient(1, size, 0, 1, ...colors)
    }

    private fillGradient(
        width: number,
        height: number,
        dirX: number,
        dirY: number,
        ...colors: string[]
    ) {
        const { canvas, ctx } = tgdCanvasCreateWithContext2D(width, height)
        const gradient = ctx.createLinearGradient(
            0,
            0,
            width * dirX,
            height * dirY
        )
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i])
        }
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
        this.loadImage(canvas)

        canvas.style.position = "fixed"
    }

    delete() {
        this.context.gl.deleteTexture(this.glTexture)
    }

    get image() {
        return this._image
    }

    get width() {
        return this._width
    }

    get height() {
        return this._height
    }

    bind() {
        const { gl } = this.context
        gl.bindTexture(gl.TEXTURE_2D, this.glTexture)
    }

    activate(program: TgdProgram, uniformName: string, slot = 0) {
        const { context, glTexture: texture } = this
        const { gl } = context
        gl.activeTexture(gl.TEXTURE0 + slot)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        program.uniform1i(uniformName, slot)
    }

    loadImage(
        image:
            | string
            | ImageData
            | HTMLImageElement
            | HTMLCanvasElement
            | HTMLVideoElement
            | ImageBitmap
    ) {
        if (typeof image === "string") {
            TgdLoaderImage.image(image)
                .then(img => {
                    if (img) {
                        this.loadImage(img)
                        this.context.paint()
                    } else {
                        console.error(
                            "[TgdTexture2D] Unable to load image:",
                            image
                        )
                    }
                })
                .catch(console.error)
            return
        }

        const { context, glTexture: texture } = this
        const { gl } = context
        gl.bindTexture(gl.TEXTURE_2D, texture)
        if (image instanceof Image) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        }
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        )
        gl.generateMipmap(gl.TEXTURE_2D)
        this._width = image.width
        this._height = image.height
        this._image = image
        this.eventImageUpdate.dispatch(this)
    }
}
