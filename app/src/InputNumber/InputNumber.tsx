import React, { ChangeEvent } from "react"
import { classNames } from "@/util/utils"

import styles from "./input-number.module.css"

export interface InputNumberProps {
    className?: string
    label: string
    value: number
    onChange(value: number): void
}

export function InputNumber({
    className,
    label,
    value,
    onChange,
}: InputNumberProps) {
    const [text, setText] = React.useState(`${value}`)
    React.useEffect(() => {}, [value])
    const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
        setText(evt.target.value)
        const num = Number(evt.target.value)
        if (!isNaN(num)) onChange(num)
    }
    return (
        <div className={classNames(styles.main, className)}>
            <label>{label}</label>
            <input type="number" value={text} onChange={handleChange} />
        </div>
    )
}
