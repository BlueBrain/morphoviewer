import { classNames } from "@/util/utils"

import styles from "./color-input.module.css"
import React from "react"
import { TgdColor } from "@bbp/morphoviewer"

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
    const handleCheckboxClick = (evt: React.MouseEvent<HTMLInputElement>) => {
        evt.preventDefault()
        evt.stopPropagation()
        const color = new TgdColor(value)
        color.A = color.A > 0.5 ? 0 : 1
        onChange(color.toString())
    }

    return (
        <button
            className={classNames(styles.main, className)}
            onClick={handleClick}
        >
            <input
                type="checkbox"
                checked={isOpaque(value)}
                onClick={handleCheckboxClick}
            />
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

const COLOR = new TgdColor()

function isOpaque(value: string): boolean | undefined {
    COLOR.parse(value)
    const opaque = COLOR.A > 0.9
    console.log(value, ">", opaque)
    return opaque
}
