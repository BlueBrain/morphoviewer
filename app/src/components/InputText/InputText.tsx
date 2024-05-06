import React, { ChangeEvent } from "react"
import { classNames } from "@/util/utils"

import styles from "./input-text.module.css"

export interface InputTextProps {
    className?: string
    label: string
    value: string
    onChange(value: string): void
}

export function InputText({
    className,
    label,
    value,
    onChange,
}: InputTextProps) {
    const [text, setText] = React.useState(`${value}`)
    React.useEffect(() => {}, [value])
    const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
        setText(evt.target.value)
        onChange(evt.target.value)
    }
    return (
        <div className={classNames(styles.main, className)}>
            <label>{label}</label>
            <input type="text" value={text} onChange={handleChange} />
        </div>
    )
}
