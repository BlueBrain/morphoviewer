import VolumeHeader from "./header"

export default class Volume {
    public attributesSizeInBytes = 0
    public qx = 0
    public qy = 0
    public qz = 0
    public qw = 0
    public x = 0
    public y = 0
    public z = 0

    private readonly dataLength: number
    private readonly typeLength: number
    private readonly view: DataView
    private readonly read: (index: number) => number

    /**
     * @param data Uncompressed data.
     */
    constructor(public readonly header: VolumeHeader, data: ArrayBufferLike) {
        this.view = new DataView(data)
        switch (header.type) {
            case "int8":
            case "int8_t":
            case "signed char":
                this.typeLength = 1
                this.read = this.readInt8
                break
            case "int16":
            case "int16_t":
            case "short":
            case "short int":
            case "signed short":
            case "signed short int":
                this.typeLength = 2
                this.read =
                    header.endian === "little"
                        ? this.readInt16LittleEndian
                        : this.readInt16BigEndian
                break
            case "int32":
            case "int32_t":
            case "int":
            case "signed int":
                this.typeLength = 4
                this.read =
                    header.endian === "little"
                        ? this.readInt32LittleEndian
                        : this.readInt32BigEndian
                break
            case "float":
                this.typeLength = 4
                this.read =
                    header.endian === "little"
                        ? this.readFloat32LittleEndian
                        : this.readFloat32BigEndian
                break
            case "double":
                this.typeLength = 8
                this.read =
                    header.endian === "little"
                        ? this.readFloat64LittleEndian
                        : this.readFloat64BigEndian
                break
            default:
                throw Error(
                    `Don't know how to deal with type "${header.type}"!\nWe only know "int8", "int16", "int32", "float" and "double".`
                )
        }
        this.dataLength = data.byteLength
    }

    walkVolume(
        callback: (
            x: number,
            y: number,
            z: number,
            qx: number,
            qy: number,
            qz: number,
            qw: number
        ) => void
    ) {
        const { x: sizeX, y: sizeY, z: sizeZ } = this.header.sizes
        const [xOrigin, yOrigin, zOrigin] = this.header.spaceOrigin
        const [xDirX, yDirX, zDirX] = this.header.spaceAxis.x
        const [xDirY, yDirY, zDirY] = this.header.spaceAxis.y
        const [xDirZ, yDirZ, zDirZ] = this.header.spaceAxis.z
        let pointer = 0
        let idxX = 0
        let idxY = 0
        let idxZ = 0
        try {
            for (idxZ = 0; idxZ < sizeZ; idxZ++) {
                for (idxY = 0; idxY < sizeY; idxY++) {
                    for (idxX = 0; idxX < sizeX; idxX++) {
                        const qx = this.read(pointer)
                        pointer += this.typeLength
                        const qy = this.read(pointer)
                        pointer += this.typeLength
                        const qz = this.read(pointer)
                        pointer += this.typeLength
                        const qw = this.read(pointer)
                        pointer += this.typeLength
                        if (
                            isNotZero(qx) ||
                            isNotZero(qy) ||
                            isNotZero(qz) ||
                            isNotZero(qw)
                        ) {
                            const x =
                                xOrigin +
                                idxX * xDirX +
                                idxY * xDirY +
                                idxZ * xDirZ
                            const y =
                                yOrigin +
                                idxX * yDirX +
                                idxY * yDirY +
                                idxZ * yDirZ
                            const z =
                                zOrigin +
                                idxX * zDirX +
                                idxY * zDirY +
                                idxZ * zDirZ
                            callback(x, y, z, qx, qy, qz, qw)
                        }
                    }
                }
            }
        } catch (ex) {
            console.error("[Volume.walkVolume] pointer =", pointer)
            console.error("[Volume.walkVolume] index =", idxX, idxY, idxZ)
            throw ex
        }
    }

    /** How many non null quaternions in this volume? */
    countNonNull() {
        const { read } = this
        let count = 0
        const size = this.typeLength
        for (let offset = 0; offset < this.dataLength; offset += size * 4) {
            if (isNotZero(read(offset))) {
                count++
                continue
            }
            if (isNotZero(read(offset + size))) {
                count++
                continue
            }
            if (isNotZero(read(offset + 2 * size))) {
                count++
                continue
            }
            if (isNotZero(read(offset + 3 * size))) {
                count++
                continue
            }
        }
        return count
    }

    private readonly readInt8 = (offset: number): number =>
        this.view.getInt8(offset)

    private readonly readInt16LittleEndian = (offset: number): number =>
        this.view.getInt16(offset, true)

    private readonly readInt16BigEndian = (offset: number): number =>
        this.view.getInt16(offset, false)

    private readonly readInt32LittleEndian = (offset: number): number =>
        this.view.getInt32(offset, true)

    private readonly readInt32BigEndian = (offset: number): number =>
        this.view.getInt32(offset, false)

    private readonly readFloat32LittleEndian = (offset: number): number =>
        this.view.getFloat32(offset, true)

    private readonly readFloat32BigEndian = (offset: number): number =>
        this.view.getFloat32(offset, false)

    private readonly readFloat64LittleEndian = (offset: number): number =>
        this.view.getFloat64(offset, true)

    private readonly readFloat64BigEndian = (offset: number): number =>
        this.view.getFloat64(offset, false)
}

const EPSILON = 1e-6

function isNotZero(x: number) {
    return Math.abs(x) > EPSILON
}
