import { classNames } from "@/util/utils"

import styles from "./color-input.module.css"
import React from "react"

export interface ColorInputProps {
    className?: string
    children: React.ReactNode
    value: string
    onChange(value: string): void
}

export function ColorInput({
    className,
    children,
    value,
    onChange,
}: ColorInputProps) {
    const refInput = React.useRef<HTMLInputElement | null>(null)
    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        onChange(evt.target.value)
    }
    const handleClick = () => {
        const input = refInput.current
        if (!input) return

        input.click()
    }
    return (
        <button
            className={classNames(styles.main, className)}
            onClick={handleClick}
        >
            {children}
            <input
                ref={refInput}
                type="color"
                value={value}
                onChange={handleChange}
            />
        </button>
    )
}
