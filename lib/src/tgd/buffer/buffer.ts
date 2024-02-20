export type TgdBufferOptionTarget =
    | "ARRAY_BUFFER"
    | "ELEMENT_ARRAY_BUFFER"
    | "COPY_READ_BUFFER"
    | "COPY_WRITE_BUFFER"
    | "TRANSFORM_FEEDBACK_BUFFER"
    | "UNIFORM_BUFFER"
    | "PIXEL_PACK_BUFFER"
    | "PIXEL_UNPACK_BUFFER"

export type TgdBufferOptionUsage =
    | "STATIC_DRAW"
    | "DYNAMIC_DRAW"
    | "STREAM_DRAW"
    | "STATIC_READ"
    | "DYNAMIC_READ"
    | "STREAM_READ"
    | "STATIC_COPY"
    | "DYNAMIC_COPY"
    | "STREAM_COPY"

export interface TgdBufferOptions {
    target: TgdBufferOptionTarget
    usage: TgdBufferOptionUsage
}

export class TgdBuffer {
    public readonly buffer: WebGLBuffer

    private _target: TgdBufferOptionTarget
    private _usage: TgdBufferOptionUsage

    constructor(
        public readonly gl: WebGL2RenderingContext,
        data?: BufferSource,
        options?: Partial<TgdBufferOptions>
    ) {
        const buffer = gl.createBuffer()
        if (!buffer) throw Error("Unable to create WebGLBuffer!")

        this._target = options?.target ?? "ARRAY_BUFFER"
        this._usage = options?.usage ?? "STATIC_DRAW"
        this.buffer = buffer
        if (data) {
            this.bufferData(data, options)
        }
    }

    get target() {
        return this._target
    }

    bind(target?: TgdBufferOptionTarget) {
        const { gl, buffer } = this
        this._target = target ?? this._target
        gl.bindBuffer(gl[this._target], buffer)
    }

    bufferData(data: BufferSource, options: Partial<TgdBufferOptions> = {}) {
        const { gl } = this
        this.bind(options.target)
        this._usage = options.usage ?? this._usage
        gl.bufferData(gl[this._target], data, gl[this._usage])
    }

    delete() {
        const { gl, buffer } = this
        gl.deleteBuffer(buffer)
    }
}
