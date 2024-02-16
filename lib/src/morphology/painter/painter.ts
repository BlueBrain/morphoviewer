import {
    TgdCameraOrthographic,
    TgdContext,
    TgdPainter,
    TgdProgram,
    TgdVertexArray,
} from "@tolokoban/tgd"

import { ColorsInterface } from "@/colors"
import { makeCapsuleAttributes } from "./capsule/capsule"
import { CellNodes } from "./nodes"
import { Segments } from "./segments"
import { getDistancesTextureCanvas, getRegionsTextureCanvas } from "./textures"

import FRAG from "./shader.frag"
import VERT from "./shader.vert"

export class SwcPainter extends TgdPainter {
    public minRadius = 1.5

    private colors: ColorsInterface | undefined
    private readonly prg: TgdProgram
    private readonly vao: TgdVertexArray
    private readonly texture: WebGLTexture
    private readonly instancesCount: number
    private _radiusMultiplier = 1
    private readonly averageRadius: number
    /**
     * - 0: Variable radius.
     * - 1: Constant radius.
     * But we can be in between if we want to mix both types.
     */
    private _radiusType = 0
    private _colorBy: "section" | "distance" = "section"
    private textureIsOutOfDate = true

    constructor(
        private readonly context: TgdContext,
        segments: Segments,
        private readonly camera: TgdCameraOrthographic
    ) {
        super()
        const { gl } = context
        const canvas = gl.canvas
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw Error(
                "This painter works only with a real HTMLCanvasElement!"
            )
        }

        this.context = context
        this.averageRadius = 1
        const prg = context.programs.create({
            vert: VERT,
            frag: FRAG,
        })
        this.prg = prg
        const { attributes: capsule, elements } = makeCapsuleAttributes()
        this.instancesCount = segments.count
        const instances = segments.makeAttributes()
        this.vao = context.createVAO(prg, [capsule, instances], elements)
        this.texture = createTexture(gl)
    }

    get colorBy() {
        return this._colorBy
    }
    set colorBy(value: "section" | "distance") {
        if (value === this._colorBy) return

        this._colorBy = value
        this.textureIsOutOfDate = true
        this.refresh()
    }

    get radiusType() {
        return this._radiusType
    }
    set radiusType(value: number) {
        if (value === this._radiusType) return

        this._radiusType = value
        this.refresh()
    }

    get radiusMultiplier() {
        return this._radiusMultiplier
    }
    set radiusMultiplier(value: number) {
        if (this._radiusMultiplier === value) return

        this._radiusMultiplier = value
        this.refresh()
    }

    public readonly paint = (_time: number) => {
        const radiusVariable = 1 - this._radiusType
        const radiusConstant = this._radiusType
        const { context, prg, camera, textureIsOutOfDate, texture, colorBy } =
            this
        const { gl } = context
        if (!gl) return

        console.log(
            "🚀 [painter] camera.zoom, camera.spaceHeight = ",
            camera.zoom,
            camera.spaceHeight
        ) // @FIXME: Remove this line written on 2024-02-15 at 18:40
        prg.use()
        this.minRadius = 8
        this.updateTextureIfNeeded(texture, textureIsOutOfDate, gl, colorBy)
        prg.uniformMatrix4fv("uniModelViewMatrix", camera.matrixViewModel)
        prg.uniformMatrix4fv("uniProjectionMatrix", camera.matrixProjection)
        const minRadius =
            (camera.zoom * (this.minRadius * camera.spaceHeight)) /
            camera.screenHeight
        prg.uniform1f("uniMinRadius", minRadius)
        gl.enable(gl.DEPTH_TEST)
        gl.clearDepth(1)
        gl.depthFunc(gl.LESS)
        gl.depthMask(true)
        gl.depthRange(0, 1)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        this.vao.bind()
        prg.uniform1f(
            "uniRadiusMultiplier",
            camera.zoom * this._radiusMultiplier * radiusVariable
        )
        prg.uniform1f(
            "uniRadiusAdditioner",
            this.averageRadius * this._radiusMultiplier * radiusConstant
        )
        prg.uniform1f("uniLightness", 1)
        prg.uniform1f("uniOutline", 1)
        prg.uniform1f("uniZFight", 0)
        gl.drawElementsInstanced(
            gl.TRIANGLES,
            16 * 3,
            gl.UNSIGNED_BYTE,
            0,
            this.instancesCount
        )
        // Outlines.
        prg.uniform1f("uniLightness", 0.25)
        prg.uniform1f("uniOutline", 1.5)
        prg.uniform1f("uniZFight", 1)
        gl.drawElementsInstanced(
            gl.TRIANGLES,
            16 * 3,
            gl.UNSIGNED_BYTE,
            0,
            this.instancesCount
        )
    }

    delete(): void {
        this.vao.delete()
    }

    update(_time: number, _delay: number): void {}

    private updateTextureIfNeeded(
        texture: WebGLTexture,
        textureIsOutOfDate: boolean,
        gl: WebGL2RenderingContext,
        colorBy: string
    ) {
        if (texture && textureIsOutOfDate) {
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                colorBy === "section"
                    ? getRegionsTextureCanvas(this.colors)
                    : getDistancesTextureCanvas()
            )
            this.textureIsOutOfDate = false
        }
    }

    resetColors(colors: ColorsInterface) {
        this.textureIsOutOfDate = true
        this.colors = colors
        this.refresh()
    }

    public readonly refresh = () => {
        window.requestAnimationFrame(this.paint)
    }
}

function createTexture(gl: WebGL2RenderingContext): WebGLTexture {
    const texture = gl.createTexture()
    if (!texture) throw Error("Unable to create a WebGLTexture!")

    gl.activeTexture(gl.TEXTURE0 + 0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    return texture
}
