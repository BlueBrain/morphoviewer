import { TgdMat4, TgdVec3, TgdVec4 } from "@tgd/math"
import { TgdProgram, TgdProgramOptions } from "@tgd/types"

/**
 * This class helps to manage a WebGLProgram.
 * It will report meaninfull errors and help you with
 * the uniforms.
 */
export class TgdProgramImpl implements TgdProgram {
    /** Access to the real WebGLProgram object. */
    public readonly program: WebGLProgram

    private readonly shaders: WebGLShader[]
    private readonly uniformsLocations: { [name: string]: WebGLUniformLocation }

    constructor(
        public readonly gl: WebGL2RenderingContext,
        private readonly code: TgdProgramOptions
    ) {
        const prg = gl.createProgram()
        if (!prg) throw Error("Unable to create WebGLProgram!")

        const vertShader = this.createShader("VERTEX_SHADER", code.vert)
        gl.attachShader(prg, vertShader)
        const fragShader = this.createShader("FRAGMENT_SHADER", code.frag)
        gl.attachShader(prg, fragShader)
        gl.linkProgram(prg)
        if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(prg) ?? ""
            console.warn(info)
            const errorLines = getErrorLines(info)
            logCode("Vertex Shader", code.vert, errorLines)
            logCode("Fragment Shader", code.frag, errorLines)
            throw new Error("Could NOT link WebGL2 program!\n" + info)
        }
        this.program = prg
        this.shaders = [vertShader, fragShader]
        this.uniformsLocations = this.getUniformsLocations()
        gl.detachShader(prg, vertShader)
        gl.deleteShader(vertShader)
        gl.detachShader(prg, fragShader)
        gl.deleteShader(fragShader)
    }

    toCode({ indent = "" }: Partial<{ indent: string }> = {}) {
        const lines: string[] = [
            `function createProgram(gl: WebGL2RenderingContext) {`,
            `  const prg = gl.createProgram()`,
            `  const vertexShader = gl.createShader(gl.VERTEX_SHADER)`,
            `  gl.shaderSource(vertexShader, \`${this.code.vert}\`)`,
            `  gl.compileShader(vertexShader)`,
            `  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)`,
            `  gl.shaderSource(fragmentShader, \`${this.code.frag}\`)`,
            `  gl.compileShader(fragmentShader)`,
            `  gl.attachShader(prg, vertexShader)`,
            `  gl.attachShader(prg, fragmentShader)`,
            `  gl.linkProgram(prg)`,
            `  return prg`,
            `}`,
        ]
        return lines.map(line => `${indent}${line}`).join("\n")
    }

    hasAttribute(name: string): boolean {
        const { gl, program } = this
        const loc = gl.getAttribLocation(program, name)
        return loc >= 0
    }

    getAttribLocation(name: string): number {
        const { gl, program } = this
        const loc = gl.getAttribLocation(program, name)
        if (loc < 0) {
            throw Error(`Attribute "${name}" not found!`)
        }
        return loc
    }

    getUniformLocation(name: string): WebGLUniformLocation {
        const { uniformsLocations } = this
        const names = Object.keys(uniformsLocations)
        if (name.length === 0) {
            console.warn(
                `Uniform "${name}" has not been found: there is no active uniform in this program!`
            )
            return 0
        }
        const location = uniformsLocations[name]
        if (!location) {
            console.warn(
                `No active uniform found with name "${name}"!\nAvailable names are: ${names.join(
                    ", "
                )}.`
            )
        }
        return location
    }

    uniform1f(name: string, value: number) {
        const { gl } = this
        gl.uniform1f(this.getUniformLocation(name), value)
    }

    uniform2f(name: string, x: number, y: number) {
        const { gl } = this
        gl.uniform2f(this.getUniformLocation(name), x, y)
    }

    uniform3f(name: string, x: number, y: number, z: number) {
        const { gl } = this
        gl.uniform3f(this.getUniformLocation(name), x, y, z)
    }

    uniform3fv(name: string, vec3: TgdVec3) {
        const { gl } = this
        gl.uniform3fv(this.getUniformLocation(name), vec3)
    }

    uniform4f(name: string, x: number, y: number, z: number, w: number) {
        const { gl } = this
        gl.uniform4f(this.getUniformLocation(name), x, y, z, w)
    }

    uniform4fv(name: string, vec4: TgdVec4) {
        const { gl } = this
        gl.uniform4fv(this.getUniformLocation(name), vec4)
    }

    uniform1i(name: string, value: number) {
        const { gl } = this
        gl.uniform1i(this.getUniformLocation(name), value)
    }

    uniform2i(name: string, x: number, y: number) {
        const { gl } = this
        gl.uniform2i(this.getUniformLocation(name), x, y)
    }

    uniform3i(name: string, x: number, y: number, z: number) {
        const { gl } = this
        gl.uniform3i(this.getUniformLocation(name), x, y, z)
    }

    uniform4i(name: string, x: number, y: number, z: number, w: number) {
        const { gl } = this
        gl.uniform4i(this.getUniformLocation(name), x, y, z, w)
    }

    uniform1ui(name: string, value: number) {
        const { gl } = this
        gl.uniform1ui(this.getUniformLocation(name), value)
    }

    uniform2ui(name: string, x: number, y: number) {
        const { gl } = this
        gl.uniform2ui(this.getUniformLocation(name), x, y)
    }

    uniform3ui(name: string, x: number, y: number, z: number) {
        const { gl } = this
        gl.uniform3ui(this.getUniformLocation(name), x, y, z)
    }

    uniform4ui(name: string, x: number, y: number, z: number, w: number) {
        const { gl } = this
        gl.uniform4ui(this.getUniformLocation(name), x, y, z, w)
    }

    uniformMatrix4fv(name: string, mat4: TgdMat4) {
        const { gl } = this
        gl.uniformMatrix4fv(this.getUniformLocation(name), false, mat4)
    }

    /**
     * Use the current program.
     * This is equivalent to `gl.useProgram(program)`.
     */
    use() {
        const { gl, program } = this
        gl.useProgram(program)
    }

    delete() {
        const { gl } = this
        this.shaders.forEach(shader => gl.deleteShader(shader))
        gl.deleteProgram(this.program)
    }

    private createShader(type: ShaderType, code: string): WebGLShader {
        const { gl } = this
        const shader = gl.createShader(gl[type])
        if (!shader)
            throw Error(`Unable to create a WebGLShader of type "${type}"!`)

        gl.shaderSource(shader, code)
        gl.compileShader(shader)
        const info = gl.getShaderInfoLog(shader)
        if (info) {
            console.error(`Error in ${type} code:`, info)
            const errorLines = getErrorLines(info)
            logCode(type, code, errorLines)
            throw Error(`Unable to compile ${type}!`)
        }
        return shader
    }

    private getUniformsLocations() {
        const { gl, program } = this
        const count: unknown = gl.getProgramParameter(
            program,
            gl.ACTIVE_UNIFORMS
        )
        if (typeof count !== "number")
            throw Error(
                "Unable to get the number of uniforms in a WebGLProgram!"
            )

        const uniforms: { [name: string]: WebGLUniformLocation } = {}
        for (let index = 0; index < count; index++) {
            const uniform = gl.getActiveUniform(program, index)
            if (!uniform) continue

            const location = gl.getUniformLocation(program, uniform.name)
            if (location === null)
                throw Error(
                    `Unable to get location for uniform "${uniform.name}"!`
                )

            uniforms[uniform.name] = location
        }
        return uniforms
    }
}

type ShaderType = "VERTEX_SHADER" | "FRAGMENT_SHADER"

const RX_ERROR_LINE = /^ERROR:[ \t]+([0-9]+):([0-9]+):/g

function getErrorLines(message: string): {
    lines: number[]
    messages: string[]
} {
    const lines: number[] = []
    const messages: string[] = []
    for (const line of message.split("\n")) {
        RX_ERROR_LINE.lastIndex = -1
        const match = RX_ERROR_LINE.exec(line)
        if (match) {
            lines.push(parseInt(match[2], 10))
            messages.push(line.substring(match[0].length).trim())
        }
    }
    return { lines, messages }
}

function style(background: string, bold = false) {
    return `color:#fff;background:${background};font-family:monospace;font-size:80%;font-weight:${
        bold ? "bolder" : "100"
    }`
}

function logCode(
    title: string,
    code: string,
    errors: { lines: number[]; messages: string[] }
) {
    console.log(`%c${title}`, "font-weight:bolder;font-size:120%")
    code.split("\n").forEach((line, index) => {
        const num = index + 1
        const prefix = (num * 1e-4).toFixed(4).substring(2)
        const background = errors.lines.includes(num) ? "#f00" : "#000"
        console.log(
            `%c${prefix}  %c${line}`,
            style(background),
            style(background, true)
        )
        if (errors.lines.includes(num)) {
            console.error(errors.messages[errors.lines.indexOf(num)])
        }
    })
}
