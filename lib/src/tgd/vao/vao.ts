import { TgdBuffer } from "@tgd/buffer"
import { TgdDataset } from "@tgd/dataset"
import { TgdProgram } from "@tgd/types"

export class TgdVertexArray {
    public readonly vao: WebGLVertexArrayObject

    private readonly drawBuffers: TgdBuffer[] = []
    private readonly elemBuffer: TgdBuffer | null = null

    constructor(
        public readonly gl: WebGL2RenderingContext,
        program?: TgdProgram,
        private readonly datasets?: Readonly<TgdDataset>[],
        elements?: BufferSource | Uint8Array | Uint16Array | Uint32Array
    ) {
        const vao = gl.createVertexArray()
        if (!vao) throw Error("Unable to create VertexArrayObject!")

        this.vao = vao
        if (!program || !datasets) return

        gl.bindVertexArray(vao)
        this.drawBuffers = datasets.map(dataset => {
            const buffer = new TgdBuffer(gl, dataset.data, {
                target: dataset.target,
                usage: dataset.usage,
            })
            buffer.bind()
            dataset.defineAttributes(gl, program)
            return buffer
        })
        if (elements) {
            const buffer = new TgdBuffer(gl, elements, {
                target: "ELEMENT_ARRAY_BUFFER",
            })
            buffer.bind()
            this.elemBuffer = buffer
        }
        gl.bindVertexArray(null)
    }

    toCode({ indent = "" }: Partial<{ indent: string }> = {}) {
        const lines: string[] = [
            "function createVAO(",
            `  gl: WebGL2RenderingContext,`,
            `  prg: WebGLProgram${this.datasets
                ?.map((ds, index) => `, data${index}: ArrayBuffer`)
                .join("")}`,
            ") {",
            "  const vao = gl.createVertexArray()",
            "  gl.bindVertexArray(vao)",
        ]
        this.datasets?.forEach((dataset, index) => {
            lines.push(
                `  const buff${index} = gl.createBuffer()`,
                `  gl.bindBuffer(gl.${dataset.target}, buff${index})`,
                `  gl.bufferData(gl.${dataset.target}, data${index}, gl.${dataset.usage})`,
                dataset.toCode({ indent: `${indent}  ` })
            )
        })
        lines.push("  return vao", "}")
        return lines.map(line => `${indent}${line}`).join("\n")
    }

    bind() {
        this.gl.bindVertexArray(this.vao)
    }

    unbind() {
        this.gl.bindVertexArray(null)
    }

    delete() {
        const { gl, vao, drawBuffers, elemBuffer } = this
        gl.deleteVertexArray(vao)
        drawBuffers.forEach(buff => buff.delete())
        if (elemBuffer) elemBuffer.delete()
    }
}
