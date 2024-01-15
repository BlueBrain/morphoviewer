import React from "react"
import { classNames } from "@/util/utils"

import styles from "./legend.module.css"
import { MorphologyPainter, colorContrast } from "@bbp/morphoviewer"
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
        <div
            className={classNames(styles.main, className)}
            style={{
                backgroundColor: `color-mix(in srgb, ${colors.background}, transparent 20%)`,
                color: colorContrast(colors.background, "#000d", "#fffd"),
            }}
        >
            {Object.keys(OPTIONS).map((att: keyof Colors) => (
                <ColorInput
                    key={att}
                    value={colors[att]}
                    onChange={v => update({ [att]: v })}
                >
                    <div
                        className={styles.color}
                        style={{
                            backgroundColor: colors[att],
                        }}
                    />
                    <div>{OPTIONS[att]}</div>
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
    const [colors, setColors] = React.useState<Colors>({ ...painter.colors })
    React.useEffect(() => {
        if (!painter) return

        const handleColorsChange = (values: Colors) => {
            console.log("handleColorsChange:", values)
            console.log("🚀 [Legend] values.soma = ", values.soma) // @FIXME: Remove this line written on 2024-01-15 at 11:33
            setColors(values)
        }
        painter.eventColorsChange.addListener(handleColorsChange)
        return () =>
            painter.eventColorsChange.removeListener(handleColorsChange)
    }, [painter])
    return [
        colors,
        (values: Partial<Colors>) => {
            console.log("🚀 [Legend] values = ", values) // @FIXME: Remove this line written on 2024-01-15 at 11:28
            const newColors = { ...colors, ...values }
            setColors(newColors)
            painter.colors.apicalDendrite = newColors.apicalDendrite
            painter.colors.axon = newColors.axon
            painter.colors.background = newColors.background
            painter.colors.basalDendrite = newColors.basalDendrite
            painter.colors.soma = newColors.soma
            console.log("🚀 [Legend] newColors = ", newColors) // @FIXME: Remove this line written on 2024-01-15 at 11:28
        },
    ]
}
