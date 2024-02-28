import { Wgl2Attributes } from "@/webgl2/attributes"
import { createProgram } from "./create"

export class Wgl2Resources {
    private readonly programs = new Set<{
        prg: WebGLProgram
        shaders: WebGLShader[]
    }>()
    private readonly buffers = new Set<WebGLBuffer>()

    constructor(public readonly gl: WebGL2RenderingContext) {}

    cleanUp() {
        const { gl } = this
        this.programs.forEach(({ prg, shaders }) => {
            shaders.forEach(shader => gl.deleteShader(shader))
            gl.deleteProgram(prg)
        })
        this.buffers.forEach(buffer => gl.deleteBuffer(buffer))
    }

    createProgram(code: { vert: string; frag: string }): WebGLProgram {
        const { prg, shaders } = createProgram(this.gl, code)
        this.programs.add({ prg, shaders })
        return prg
    }

    createBuffer(): WebGLBuffer {
        const buffer = this.gl.createBuffer()
        if (!buffer) throw Error("Unable to create a WebGLBuffer!")

        this.buffers.add(buffer)
        return buffer
    }

    createVAO(
        prg: WebGLProgram,
        ...attributes: (
            | Wgl2Attributes
            | ((res: Wgl2Resources) => void)
            | Uint8Array
            | Uint16Array
            | Uint32Array
        )[]
    ): WebGLVertexArrayObject {
        const { gl } = this
        const vao = gl.createVertexArray()
        if (!vao) throw Error("Unable to create VertexArrayObject!")

        gl.bindVertexArray(vao)
        let hasAlreadyInitializedAnElementArray = false
        for (const item of attributes) {
            if (typeof item === "function") {
                item(this)
            } else if (
                item instanceof Uint8Array ||
                item instanceof Uint16Array ||
                item instanceof Uint32Array
            ) {
                if (hasAlreadyInitializedAnElementArray) {
                    throw Error(
                        "createVAO() can have only one UintArray in the arguments!"
                    )
                }
                hasAlreadyInitializedAnElementArray = true
                const buff = this.createBuffer()
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff)
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, item, gl.STATIC_DRAW)
            } else {
                if (!item.buffer) item.buffer = this.createBuffer()
                item.update(gl)
                gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer)
                item.define(gl, prg)
            }
        }
        gl.bindVertexArray(null)
        return vao
    }

    getUniformsLocations(prg: WebGLProgram): {
        [name: string]: WebGLUniformLocation
    } {
        const { gl } = this
        const count: unknown = gl.getProgramParameter(prg, gl.ACTIVE_UNIFORMS)
        if (typeof count !== "number")
            throw Error(
                "Unable to get the number of uniforms in a WebGLProgram!"
            )

        const uniforms: { [name: string]: WebGLUniformLocation } = {}
        for (let index = 0; index < count; index++) {
            const uniform = gl.getActiveUniform(prg, index)
            if (!uniform) continue

            const location = gl.getUniformLocation(prg, uniform.name)
            if (location === null)
                throw Error(
                    `Unable to get location for uniform "${uniform.name}"!`
                )

            uniforms[uniform.name] = location
        }
        return uniforms
    }
}
