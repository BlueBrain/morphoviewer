const NRRD_MAGIC_NUMBER = /^NRRD[0-9]{4}$/g

type Field = [name: string, value: string]
type Vector3 = [x: number, y: number, z: number]
interface Axis {
    x: Vector3
    y: Vector3
    z: Vector3
}

export default class VolumeHeader {
    /**
     * Center of the volume in space coordinates.
     */
    public readonly center: Vector3
    public readonly boundingSphereRadius: number
    /** "little", "big" */
    public readonly endian: string
    /** Should be 4: 3 for the space and 1 for the quaternion. */
    public readonly dimension: number
    /** If "gzip" we will need to gunzip the data. */
    public readonly encoding: string
    /** Sizes of each dimension: quaternion, z, y, x. */
    public readonly sizes: {
        quaternion: number
        x: number
        y: number
        z: number
    }
    /** Should be 3 because we are working in 3D. */
    public readonly spaceDimension: number
    /** Position of the bounding box corner. */
    public readonly spaceOrigin: Vector3
    /** The axis defining a voxel. */
    public readonly spaceAxis: Axis
    /** We only support "int8" for now. */
    public readonly type: string

    constructor(content: string) {
        const lines = content
            .trim()
            .split(/[\n\r]+/g)
            .filter(isNotComment)
        assertMagicNumber(lines)
        const fieldsArray = lines.map(toField).filter(isDefined) as Field[]
        const fields = new Map<string, string>()
        for (const [name, value] of fieldsArray) {
            fields.set(name, value)
        }
        this.dimension = parseInt(readField(fields, "dimension"))
        this.encoding = readField(fields, "encoding")
        this.endian = readField(fields, "endian", "N/A")
        this.sizes = parseSizes(fields)
        this.spaceDimension = parseInt(readField(fields, "space dimension"))
        this.spaceOrigin = parseSpaceOrigin(fields)
        this.spaceAxis = parseSpaceAxis(fields)
        this.type = readField(fields, "type")
        if (this.dimension !== 4)
            throw Error(
                `We need 4 dimensions, but the file has ${this.dimension}!`
            )
        if (this.spaceDimension !== 3)
            throw Error(
                `The space is 3D, but the file is defined in ${this.dimension}D!`
            )
        this.center = this.computeCenter()
        this.boundingSphereRadius = this.computeBoundingSphereRadius()
    }

    private computeCenter(): Vector3 {
        const [ox, oy, oz] = this.spaceOrigin
        const [axx, axy, axz] = this.spaceAxis.x
        const [ayx, ayy, ayz] = this.spaceAxis.y
        const [azx, azy, azz] = this.spaceAxis.z
        const { x: sizeX, y: sizeY, z: sizeZ } = this.sizes
        const x = ox + 0.5 * (axx * sizeX + ayx * sizeY + azx * sizeZ)
        const y = oy + 0.5 * (axy * sizeX + ayy * sizeY + azy * sizeZ)
        const z = oz + 0.5 * (axz * sizeX + ayz * sizeY + azz * sizeZ)
        return [x, y, z]
    }

    private computeBoundingSphereRadius(): number {
        const [ox, oy, oz] = this.spaceOrigin
        const [cx, cy, cz] = this.center
        const x = cx - ox
        const y = cy - oy
        const z = cz - oz
        return Math.sqrt(x * x + y * y + z * z) / 2
    }
}

function isDefined<T>(item: T | undefined) {
    return typeof item !== "undefined"
}

function toField(line: string): Field | undefined {
    const colonPosition = line.indexOf(":")
    if (colonPosition < 0) return

    return [
        line.substring(0, colonPosition),
        line.substring(colonPosition + 1).trim(),
    ]
}

function isNotComment(line: string) {
    return !line.startsWith("#")
}

function assertMagicNumber(lines: string[]) {
    // Remove the first line, which should be the file magic number.
    const magicNumber = lines.shift() ?? ""
    NRRD_MAGIC_NUMBER.lastIndex = -1
    if (!NRRD_MAGIC_NUMBER.test(magicNumber)) {
        throw Error("This is not a valid NRRD file!\nWrong magic number.")
    }
}

function readField(
    fields: Map<string, string>,
    name: string,
    defaultValue?: string
): string {
    if (!fields.has(name)) {
        if (typeof defaultValue === "string") return defaultValue

        throw Error(`NRRD header missed the mandatory field "${name}"!`)
    }

    return fields.get(name) ?? ""
}

function parseSizes(fields: Map<string, string>): {
    quaternion: number
    z: number
    y: number
    x: number
} {
    const text = readField(fields, "sizes")
    const elements = text.split(/[ \t]+/)
    console.log("🚀 [header] text = ", text) // @FIXME: Remove this line written on 2022-07-20 at 17:18
    console.log("🚀 [header] elements = ", elements) // @FIXME: Remove this line written on 2022-07-20 at 17:20
    const values = elements.map(t => parseInt(t, 10))
    if (values.length !== 4)
        throw Error(
            `Field "sizes" must be an array with 4 elements, not with ${elements.length}!`
        )
    const [quaternion, x, y, z] = values
    return { quaternion, x, y, z }
}

function parseSpaceOrigin(fields: Map<string, string>): Vector3 {
    return parseVector3(readField(fields, "space origin"))
}

function parseSpaceAxis(fields: Map<string, string>): Axis {
    const NUM = "([e0-9.-]+)"
    const SEP = "[,\\s]+"
    const VEC = `\\(\\s*${NUM}${SEP}${NUM}${SEP}${NUM}\\s*\\)`
    const RX_SPACE_DIRECTIONS = new RegExp(
        `^\[^(]*${VEC}\\s*${VEC}\\s*${VEC}\\s*$`,
        "gi"
    )
    const field = readField(fields, "space directions")
    const match = RX_SPACE_DIRECTIONS.exec(field)
    if (!match) {
        console.error(`Unable to parse field "space directions"!`, field)
        console.error("RegExp:", RX_SPACE_DIRECTIONS.source)
        throw Error(`Unable to parse field "space directions"!`)
    }
    const [_all, xx, xy, xz, yx, yy, yz, zx, zy, zz] = match
    return {
        x: [parseFloat(xx), parseFloat(xy), parseFloat(xz)],
        y: [parseFloat(yx), parseFloat(yy), parseFloat(yz)],
        z: [parseFloat(zx), parseFloat(zy), parseFloat(zz)],
    }
}

function parseVector3(text: string): Vector3 {
    text = text.trim()
    if (!text.startsWith("(") || !text.endsWith(")")) {
        throw Error(`Wrong Vector format: "${text}"!`)
    }
    const elements = text
        .substring(1, text.length - 1)
        .split(",")
        .map(parseFloat)
    if (elements.length !== 3)
        throw Error(`Vectors must have 3 dimensons: "${text}"!`)

    return elements as Vector3
}
