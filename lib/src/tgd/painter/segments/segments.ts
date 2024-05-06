import { TgdDataset } from "@tgd/dataset"
import { TgdPainter } from "@tgd/painter/painter"
import {
    ArrayNumber2,
    ArrayNumber4,
    TgdContextInterface,
    TgdProgram,
    TgdTexture2D,
} from "@tgd/types"
import { TgdVertexArray } from "@tgd/vao"

import FRAG from "./segments.frag"
import VERT from "./segments.vert"

export type TgdPainterSegmentsOptions = {
    /**
     * How round the tip will be?
     *  - **0** means that the tip is flat.
     *  - **1** will gives you a triangled tip.
     *  - **>1** starts to have a semi-circle shape.
     *
     * **0** is the fastest to render, but you will have
     * a bad connection at joints between segments.
     *
     * Default to **3**.
     */
    roundness: number
    /**
     * With orthographic camera, this is a value in pixels.
     */
    minRadius: number
}

/**
 * @example
 * ```
 * const factory = new TgdPainterSegmentsData()
 * factory.add(
 *   [0, 0, 0, .2],
 *   [1, 0, 0, .1],
 * )
 * factory.add(
 *   [0, 0, 0, .2],
 *   [0, 1, 0, .1],
 * )
 * factory.add(
 *   [0, 0, 0, .2],
 *   [0, 0, 1, .1],
 * )
 * const segments = new TgdPainterSegments(
 *   segment, factory
 * )
 * ```
 */
export class TgdPainterSegments extends TgdPainter {
    public colorTexture: TgdTexture2D
    public minRadius: number = 0
    public radiusMultiplier = 1
    public radiusConstant = 1
    public radiusSwitch = 0
    public light = 1
    public shiftZ = 0

    private readonly vao: TgdVertexArray
    private readonly prg: TgdProgram
    private readonly vertexCount: number
    private readonly instanceCount: number

    constructor(
        protected readonly context: TgdContextInterface,
        factory: { makeDataset: () => InstanceDataset; readonly count: number },
        {
            roundness = 3,
            minRadius = 0,
        }: Partial<TgdPainterSegmentsOptions> = {}
    ) {
        super()
        this.minRadius = minRadius
        if (roundness > 125) {
            throw Error("[TgdPainterSegments] Max roundness is 125!")
        }
        if (roundness < 0) {
            throw Error("[TgdPainterSegments] Min roundness is 0!")
        }
        const tex = context.textures2D.create({
            magFilter: "NEAREST",
            minFilter: "NEAREST",
            wrapR: "CLAMP_TO_EDGE",
            wrapS: "CLAMP_TO_EDGE",
            wrapT: "CLAMP_TO_EDGE",
        })
        tex.makePalette(["#f00", "#0f0", "#00f"])
        this.colorTexture = tex
        const prg = context.programs.create({
            vert: VERT,
            frag: FRAG,
        })
        this.prg = prg
        const { capsule, elements } = makeCapsule(roundness)
        const instance = factory.makeDataset()
        this.vao = context.createVAO(prg, [capsule, instance], elements)
        this.vertexCount = elements.length
        this.instanceCount = instance.count
    }

    delete(): void {
        this.vao.delete()
    }

    paint(_time: number, _delay: number): void {
        const {
            context,
            prg,
            vao,
            colorTexture,
            vertexCount,
            instanceCount,
            light,
            radiusMultiplier,
            radiusConstant,
            radiusSwitch,
            shiftZ,
        } = this
        const { gl, camera } = context
        prg.use()
        const minRadius =
            (this.minRadius * camera.spaceHeightAtTarget) /
            (camera.zoom * camera.screenHeight)
        prg.uniform1f("uniMinRadius", minRadius)
        prg.uniform1f("uniLight", light)
        prg.uniform1f("uniShiftZ", shiftZ)
        prg.uniform1f("uniRadiusMultiplier", radiusMultiplier)
        prg.uniform1f("uniRadiusConstant", radiusConstant)
        prg.uniform1f("uniRadiusSwitch", radiusSwitch)
        colorTexture.activate(prg, "uniTexture")
        prg.uniformMatrix4fv("uniModelViewMatrix", camera.matrixModelView)
        prg.uniformMatrix4fv("uniProjectionMatrix", camera.matrixProjection)
        vao.bind()
        gl.drawElementsInstanced(
            gl.TRIANGLES,
            vertexCount,
            gl.UNSIGNED_BYTE,
            0,
            instanceCount
        )
    }
}

type InstanceDataset = TgdDataset

export class TgdPainterSegmentsData {
    private _count = 0
    private readonly attAxyzr: number[] = []
    private readonly attAuv: number[] = []
    private readonly attAinfluence: number[] = []
    private readonly attBxyzr: number[] = []
    private readonly attBuv: number[] = []
    private readonly attBinfluence: number[] = []

    get count() {
        return this._count
    }

    /**
     * @param Axyzr (x,y,z) and radius of point A.
     * @param Bxyzr (x,y,z) and radius of point B.
     * @param Auv
     * @param Buv
     * @param radiusMultiplierInfluenceA
     * @param radiusMultiplierInfluenceB
     */
    add(
        Axyzr: ArrayNumber4,
        Bxyzr: ArrayNumber4,
        Auv: ArrayNumber2 = [0, 0],
        Buv: ArrayNumber2 = [0, 0],
        radiusMultiplierInfluenceA = 1,
        radiusMultiplierInfluenceB = 1
    ) {
        this.attAxyzr.push(...Axyzr)
        this.attAuv.push(...Auv)
        this.attAinfluence.push(radiusMultiplierInfluenceA)
        this.attBxyzr.push(...Bxyzr)
        this.attBuv.push(...Buv)
        this.attBinfluence.push(radiusMultiplierInfluenceB)
        this._count++
    }

    makeDataset(): InstanceDataset {
        const dataset = new TgdDataset(
            {
                attAxyzr: "vec4",
                attAuv: "vec2",
                attAinfluence: "float",
                attBxyzr: "vec4",
                attBuv: "vec2",
                attBinfluence: "float",
            },
            {
                divisor: 1,
            }
        )
        dataset.set("attAxyzr", new Float32Array(this.attAxyzr))
        dataset.set("attAuv", new Float32Array(this.attAuv))
        dataset.set("attAinfluence", new Float32Array(this.attAinfluence))
        dataset.set("attBxyzr", new Float32Array(this.attBxyzr))
        dataset.set("attBuv", new Float32Array(this.attBuv))
        dataset.set("attBinfluence", new Float32Array(this.attBinfluence))
        return dataset
    }
}

type CapsuleDataset = TgdDataset

/**
 * The capsule is a 2D shape (x,y) that will be uses
 * as a pattern for the segment.
 * The segment will expand this template along Y axis.
 * The tip pointing toward +Y is called A.
 * The tip pointing toward -Y is called B.
 * The z coodinates indicates to which tip the point
 * is attached: 0 for A and 1 for B.
 */
function makeCapsule(roundness: number): {
    capsule: CapsuleDataset
    elements: Uint8Array
} {
    // prettier-ignore
    const offset: number[] =[
         0, 0, 0,
         1, 0, 0,
        -1, 0, 0,
         0, 0, 1,
         1, 0, 1,
        -1, 0, 1,
    ]
    // prettier-ignore
    const elements: number[] = [
        0, 3, 1,
        3, 4, 1,
        0, 2, 5,
        3, 0, 5,
    ]
    if (roundness > 0) {
        let oldIndexA = 1
        let oldIndexB = 4
        let elemIndex = 6
        for (let i = 0; i < roundness; i++) {
            const ang = (Math.PI * (i + 1)) / (roundness + 1)
            const x = Math.cos(ang)
            const y = Math.sin(ang)
            // We set z to 0 because it's related to tip A.
            offset.push(x, y, 0)
            elements.push(0, oldIndexA, elemIndex)
            oldIndexA = elemIndex
            elemIndex++
            // We set z to 1 because it's related to tip B.
            offset.push(x, -y, 1)
            elements.push(3, elemIndex, oldIndexB)
            oldIndexB = elemIndex
            elemIndex++
        }
        elements.push(0, oldIndexA, 2)
        elements.push(3, 5, oldIndexB)
    }
    const capsule: CapsuleDataset = new TgdDataset({
        attOffset: "vec3",
    })
    capsule.set("attOffset", new Float32Array(offset))
    return {
        capsule,
        elements: new Uint8Array(elements),
    }
}
