export async function tgdFetchArrayBuffer(url: string): Promise<ArrayBuffer> {
    const resp = await fetch(url)
    return resp.arrayBuffer()
}
