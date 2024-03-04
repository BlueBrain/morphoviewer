/**
 * NRRD files start with a ascii header.
 * This header is ended by `\r\n\r\n` or `\n\n`.
 */
export function getHeaderLength(data: Uint8Array) {
    const CR = "\r".charCodeAt(0)
    const LF = "\n".charCodeAt(0)
    const ESCAPE = "\\".charCodeAt(0)
    let state = 0
    let cursor = 0
    while (cursor < data.length) {
        const char = data[cursor++]
        if (char === ESCAPE) {
            // Escape character
            cursor++
            continue
        }
        switch (state) {
            // Waiting for first CR or LF.
            case 0:
                if (char === CR) state = 1
                else if (char === LF) state = 4
                break
            // Waiting for first LF after a CR.
            case 1:
                if (char === LF) state = 2
                else state = 0
                break
            // Waiting for second CR.
            case 2:
                if (char === CR) state = 3
                else state = 0
                break
            // Waiting for second LF after a CR.
            case 3:
                if (char === LF) return cursor
                else state = 0
                break
            // Waiting for second LF after another LF.
            case 4:
                if (char === LF) return cursor
                else state = 0
                break
        }
    }
    return 0
}
