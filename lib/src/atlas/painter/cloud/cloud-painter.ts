import { Wgl2Camera, Wgl2CameraOrthographic } from "@/webgl2/camera"
import { Wgl2Resources } from "@/webgl2/resources/resources"

import FRAG from "./shader.frag"
import VERT from "./shader.vert"
import { Wgl2Attributes } from "@/webgl2/attributes"

/**
 * Render a totaly opaque black and white mesh
 * with ghost material.
 */
export class CloudPainter {
    public color: [red: number, green: number, blue: number, alpha: number] = [
        1, 1, 1, 1,
    ]
    public radius = 10

    private readonly gl: WebGL2RenderingContext
    private readonly prg: WebGLProgram
    private readonly vao: WebGLVertexArrayObject
    private readonly locations: { [name: string]: WebGLUniformLocation }
    private readonly count: number

    constructor(resources: Wgl2Resources, data: Float32Array) {
        this.gl = resources.gl
        const prg = resources.createProgram({
            vert: VERT,
            frag: FRAG,
        })
        this.prg = prg
        this.locations = resources.getUniformsLocations(prg)
        const attributes = new Wgl2Attributes({ attPosition: 3 })
        attributes.set("attPosition", data)
        this.vao = resources.createVAO(prg, attributes)
        this.count = Math.floor(data.length / 3)
    }

    public readonly paint = (camera: Wgl2CameraOrthographic) => {
        const { gl, prg, locations } = this
        camera.viewport.width = gl.drawingBufferWidth
        camera.viewport.height = gl.drawingBufferHeight
        gl.useProgram(prg)
        gl.enable(gl.DEPTH_TEST)
        gl.disable(gl.BLEND)
        // gl.blendEquation(gl.FUNC_ADD)
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
        camera.setUniforms(
            gl,
            locations["uniModelViewMatrix"],
            locations["uniProjectionMatrix"]
        )
        const size = this.radius / camera.zoom.get()
        gl.uniform1f(locations["uniSize"], size)
        gl.uniform4fv(locations["uniColor"], this.color)
        gl.clearDepth(1)
        gl.depthFunc(gl.LESS)
        gl.depthMask(true)
        gl.depthRange(0, 1)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.bindVertexArray(this.vao)
        gl.drawArrays(gl.POINTS, 0, this.count)
    }
}
