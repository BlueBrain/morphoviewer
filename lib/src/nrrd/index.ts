import Volume from "./volume"
import VolumeHeader from "./header"
import { decompress, FlateError } from "fflate"
import { getHeaderLength } from "./get-header-length"

export async function parseNRRD(buffer: ArrayBuffer): Promise<Volume> {
    const data = new Uint8Array(buffer)
    const headerLength = getHeaderLength(data)
    const headerData = data.subarray(0, headerLength)
    const header = new VolumeHeader(new TextDecoder().decode(headerData))
    console.log("🚀 [index] header = ", header) // @FIXME: Remove this line written on 2022-07-20 at 17:16
    const zippedBody = data.subarray(headerLength)
    console.log(`Unzippin ${zippedBody.byteLength} bytes...`)
    const body = await gunzip(zippedBody)
    console.log(`...into ${body.byteLength} bytes.`)
    return new Volume(header, body.buffer)
}

async function gunzip(content: Uint8Array): Promise<Uint8Array> {
    return new Promise(resolve => {
        decompress(content, (err: FlateError | null, data: Uint8Array) => {
            if (err) {
                console.error(err)
                throw Error(`Unable to gunzip NRRD data!\n${err.message}`)
            }
            resolve(data)
        })
    })
}
