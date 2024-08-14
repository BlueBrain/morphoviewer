export function classNames(...names: unknown[]): string {
    return names.filter(name => typeof name === "string").join(" ")
}

export function sleep(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration))
}
