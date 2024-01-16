import { AtlasMeshOptions } from "@/atlas/atlas-mesh"
import { parseWavefront } from "@/parser/wavefront"
import { Wgl2Camera } from "@/webgl2/camera"
import { Wgl2FactoryMesh } from "@/webgl2/factory/mesh"
import { Wgl2Resources } from "@/webgl2/resources/resources"

import FRAG from "./shader.frag"
import VERT from "./shader.vert"

export class MeshPainter {
    private readonly gl: WebGL2RenderingContext
    private readonly prg: WebGLProgram
    private readonly vao: WebGLVertexArrayObject
    private readonly locations: { [name: string]: WebGLUniformLocation }
    private readonly elementsType: number
    private readonly elementsCount: number

    constructor(resources: Wgl2Resources, wavefrontContent: string) {
        this.gl = resources.gl
        const { vertices, triangles } = parseWavefront(wavefrontContent)
        const factory = new Wgl2FactoryMesh(vertices, triangles)
        const data = factory.getData()
        const prg = resources.createProgram({
            vert: VERT,
            frag: FRAG,
        })
        this.prg = prg
        this.locations = resources.getUniformsLocations(prg)
        this.vao = resources.createVAO(prg, data.attributes, data.elements)
        if (data.elements instanceof Uint8Array) {
            this.elementsType = this.gl.UNSIGNED_BYTE
        } else if (data.elements instanceof Uint16Array) {
            this.elementsType = this.gl.UNSIGNED_SHORT
        } else {
            this.elementsType = this.gl.UNSIGNED_INT
        }
        this.elementsCount = data.elements.length
    }

    public readonly paint = (
        camera: Wgl2Camera,
        options: AtlasMeshOptions,
        time: number
    ) => {
        const { gl, locations } = this
        camera.viewport.width = gl.drawingBufferWidth
        camera.viewport.height = gl.drawingBufferHeight
        gl.useProgram(this.prg)
        camera.setUniforms(
            gl,
            locations["uniModelViewMatrix"],
            locations["uniProjectionMatrix"]
        )
        gl.enable(gl.DEPTH_TEST)
        gl.clearDepth(1)
        gl.depthFunc(gl.LESS)
        gl.depthMask(true)
        gl.depthRange(0, 1)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.bindVertexArray(this.vao)
        gl.drawElements(gl.TRIANGLES, this.elementsCount, this.elementsType, 0)
    }
}
