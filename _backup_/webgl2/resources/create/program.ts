export function createProgram(
    gl: WebGL2RenderingContext,
    code: { vert: string; frag: string }
): { prg: WebGLProgram; shaders: WebGLShader[] } {
    const prg = gl.createProgram()
    if (!prg) {
        throw Error(`Unable to create a WebGL program!`)
    }
    const vertShader = createShader(gl, "vertex", code.vert)
    gl.attachShader(prg, vertShader)
    const fragShader = createShader(gl, "fragment", code.frag)
    gl.attachShader(prg, fragShader)
    gl.linkProgram(prg)
    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(prg) ?? ""
        console.warn(info)
        const errorLines = getErrorLines(info)
        logCode("Vertex Shader", code.vert, ...errorLines)
        logCode("Fragment Shader", code.frag, ...errorLines)
        throw new Error("Could NOT link WebGL2 program!\n" + info)
    }
    return { prg, shaders: [vertShader, fragShader] }
}

function createShader(
    gl: WebGL2RenderingContext,
    type: "vertex" | "fragment",
    code: string
): WebGLShader {
    const shader = gl.createShader(
        type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER
    )
    if (!shader) throw Error("Unable to create a Vertex Shader handle!")

    gl.shaderSource(shader, code)
    gl.compileShader(shader)
    const info = gl.getShaderInfoLog(shader) ?? ""
    if (info.length > 0) {
        console.error("Shader error!", info)
        const errorLines = getErrorLines(info)
        logCode(`${type.toUpperCase()} Shader`, code, ...errorLines)
        throw Error(`Error in ${type.toUpperCase()} shader: ${info}`)
    }
    return shader
}

const RX_ERROR_LINE = /^ERROR:[ \t]+([0-9]+):([0-9]+):/g

function getErrorLines(message: string): number[] {
    const errorLines: number[] = []
    for (const line of message.split("\n")) {
        RX_ERROR_LINE.lastIndex = -1
        const match = RX_ERROR_LINE.exec(line)
        if (match) errorLines.push(parseInt(match[2], 10))
    }
    return errorLines
}

function style(background: string, bold = false) {
    return `color:#fff;background:${background};font-family:monospace;font-size:80%;font-weight:${
        bold ? "bolder" : "100"
    }`
}

function logCode(title: string, code: string, ...errorLines: number[]) {
    console.log(`%c${title}`, "font-weight:bolder;font-size:120%")
    code.split("\n").forEach((line, index) => {
        const num = index + 1
        const prefix = (num * 1e-4).toFixed(4).substring(2)
        const background = errorLines.includes(num) ? "#f00" : "#000"
        console.log(
            `%c${prefix}  %c${line}`,
            style(background),
            style(background, true)
        )
    })
}
