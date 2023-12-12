import React from "react"

import styles from "./file-upload.module.css"

export interface FileUploadProps {
    children: string
    onLoaded(content: string): void
}

export function FileUpload({ children, onLoaded }: FileUploadProps) {
    const refInput = React.useRef<HTMLInputElement | null>(null)
    const handleClick = () => {
        const input = refInput.current
        if (!input) return

        input.click()
    }
    const handleChange = () => {
        const input = refInput.current
        if (!input) return

        const file = input.files?.item(0)
        if (!file) return

        const reader = new FileReader()
        reader.onload = (evt: ProgressEvent<FileReader>) => {
            const data = evt.target?.result
            if (typeof data === "string") onLoaded(data)
        }
        reader.readAsText(file)
    }
    return (
        <button className={styles.main} onClick={handleClick}>
            <div>{children}</div>
            <input type="file" ref={refInput} onChange={handleChange} />
        </button>
    )
}
