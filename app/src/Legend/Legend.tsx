import React from "react"
import { classNames } from "@/util/utils"

import styles from "./legend.module.css"
import { MorphologyPainter } from "@bbp/morphoviewer"
import { ColorInput } from "@/ColorInput"

export interface LegendProps {
    className?: string
    painter: MorphologyPainter
}

const OPTIONS: Record<keyof Colors, string> = {
    soma: "Soma",
    basalDendrite: "Basal dendrite",
    apicalDendrite: "Apical dendrite",
    axon: "Axon",
    background: "Background",
}

export function Legend({ className, painter }: LegendProps) {
    const [colors, update] = useColors(painter)
    return (
        <div className={classNames(styles.main, className)}>
            {Object.keys(OPTIONS).map((att: keyof Colors) => (
                <ColorInput
                    key={att}
                    value={colors[att]}
                    onChange={v => update({ [att]: v })}
                >
                    <div>{OPTIONS[att]}</div>
                    <div
                        className={styles.color}
                        style={{
                            backgroundColor: colors[att],
                        }}
                    />
                </ColorInput>
            ))}
        </div>
    )
}

interface Colors {
    background: string
    soma: string
    axon: string
    apicalDendrite: string
    basalDendrite: string
}

function useColors(
    painter: MorphologyPainter
): [colors: Colors, update: (values: Partial<Colors>) => void] {
    const [colors, setColors] = React.useState<Colors>(painter.colors)
    return [
        colors,
        (values: Partial<Colors>) => {
            const newColors = { ...colors, ...values }
            setColors(newColors)
            painter.colors.apicalDendrite = newColors.apicalDendrite
            painter.colors.axon = newColors.axon
            painter.colors.background = newColors.background
            painter.colors.basalDendrite = newColors.basalDendrite
            painter.colors.soma = newColors.soma
        },
    ]
}
