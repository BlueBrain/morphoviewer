import { Wgl2Attributes } from "@/webgl2/attributes"
import { Wgl2Camera } from "@/webgl2/camera/camera"
import { Wgl2Resources } from "@/webgl2/resources/resources"

import VERT from "./shader.vert"
import FRAG from "./shader.frag"

export class Grid {
    public x = 0
    public y = 0
    public z = 0

    private readonly count: number
    private gl: WebGL2RenderingContext | null = null
    private prg: WebGLProgram | null = null
    private vao: WebGLVertexArrayObject | null = null
    private locations: { [name: string]: WebGLUniformLocation } = {}

    constructor(
        private readonly res: Wgl2Resources,
        private readonly camera: Wgl2Camera
    ) {
        this.gl = res.gl
        const att = new Wgl2Attributes({
            attPos: 3,
            attCol: 3,
        })
        const pos: number[] = []
        const col: number[] = []
        let count = 0
        const line = (
            x1: number,
            y1: number,
            z1: number,
            x2: number,
            y2: number,
            z2: number,
            [r, g, b]: number[]
        ) => {
            pos.push(x1, y1, z1, x2, y2, z2)
            col.push(r, g, b, r, g, b)
            count += 2
        }
        const size = 10
        const RED = [1, 0, 0]
        const GREEN = [0, 1, 0]
        const GREY = [0.5, 0.5, 0.5]
        for (let i = -size; i <= size; i++) {
            line(-size, i, 0, size, i, 0, i === 0 ? RED : GREY)
            line(i, -size, 0, i, size, 0, i === 0 ? GREEN : GREY)
        }
        att.set("attPos", new Float32Array(pos))
        att.set("attCol", new Float32Array(col))
        this.count = count
        this.prg = res.createProgram({ vert: VERT, frag: FRAG })
        this.locations = res.getUniformsLocations(this.prg)
        this.vao = res.createVAO(this.prg, att)
    }

    paint() {
        const { gl, camera, locations } = this
        if (!gl) return

        gl.useProgram(this.prg)
        gl.uniform3f(locations["uniCenter"], this.x, this.y, this.z)
        camera.setUniforms(
            gl,
            locations["uniModelViewMatrix"],
            locations["uniProjectionMatrix"]
        )
        gl.bindVertexArray(this.vao)
        gl.drawArrays(gl.LINES, 0, this.count)
    }
}
