export function tgdEasingFunctionLinear(x: number) {
    return x
}

export function tgdEasingFunctionInSine(x: number): number {
    return 1 - Math.cos((x * Math.PI) / 2)
}

export function tgdEasingFunctionOutSine(x: number): number {
    return Math.sin((x * Math.PI) / 2)
}

export function tgdEasingFunctionInOutSine(x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2
}

export function tgdEasingFunctionInQuad(x: number): number {
    return x * x
}

export function tgdEasingFunctionOutQuad(x: number): number {
    return 1 - (1 - x) * (1 - x)
}

export function tgdEasingFunctionInOutQuad(x: number): number {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}

export function tgdEasingFunctionInCubic(x: number): number {
    return x * x * x
}

export function tgdEasingFunctionOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3)
}

export function tgdEasingFunctionInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export function tgdEasingFunctionInQuart(x: number): number {
    return x * x * x * x
}

export function tgdEasingFunctionOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4)
}

export function tgdEasingFunctionInOutQuart(x: number): number {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
}

export function tgdEasingFunctionInQuint(x: number): number {
    return x * x * x * x * x
}

export function tgdEasingFunctionOutQuint(x: number): number {
    return 1 - Math.pow(1 - x, 5)
}

export function tgdEasingFunctionInOutQuint(x: number): number {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2
}

export function tgdEasingFunctionInExpo(x: number): number {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10)
}

export function tgdEasingFunctionOutExpo(x: number): number {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

export function tgdEasingFunctionInOutExpo(x: number): number {
    return x === 0
        ? 0
        : x === 1
        ? 1
        : x < 0.5
        ? Math.pow(2, 20 * x - 10) / 2
        : (2 - Math.pow(2, -20 * x + 10)) / 2
}

export function tgdEasingFunctionInCirc(x: number): number {
    return 1 - Math.sqrt(1 - Math.pow(x, 2))
}

export function tgdEasingFunctionOutCirc(x: number): number {
    return Math.sqrt(1 - Math.pow(x - 1, 2))
}

export function tgdEasingFunctionInOutCirc(x: number): number {
    return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
}

export function tgdEasingFunctionInBack(x: number): number {
    const c1 = 1.70158
    const c3 = c1 + 1

    return c3 * x * x * x - c1 * x * x
}

export function tgdEasingFunctionOutBack(x: number): number {
    const c1 = 1.70158
    const c3 = c1 + 1

    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

export function tgdEasingFunctionInOutBack(x: number): number {
    const c1 = 1.70158
    const c2 = c1 * 1.525

    return x < 0.5
        ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
        : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2
}

export function tgdEasingFunctionInElastic(x: number): number {
    const c4 = (2 * Math.PI) / 3

    return x === 0
        ? 0
        : x === 1
        ? 1
        : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4)
}

export function tgdEasingFunctionOutElastic(x: number): number {
    const c4 = (2 * Math.PI) / 3

    return x === 0
        ? 0
        : x === 1
        ? 1
        : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
}

export function tgdEasingFunctionInOutElastic(x: number): number {
    const c5 = (2 * Math.PI) / 4.5

    return x === 0
        ? 0
        : x === 1
        ? 1
        : x < 0.5
        ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1
}

export function tgdEasingFunctionInBounce(x: number): number {
    return 1 - tgdEasingFunctionOutBounce(1 - x)
}

export function tgdEasingFunctionOutBounce(x: number): number {
    const n1 = 7.5625
    const d1 = 2.75

    if (x < 1 / d1) {
        return n1 * x * x
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375
    }
}

export function tgdEasingFunctionInOutBounce(x: number): number {
    return x < 0.5
        ? (1 - tgdEasingFunctionOutBounce(1 - 2 * x)) / 2
        : (1 + tgdEasingFunctionOutBounce(2 * x - 1)) / 2
}
