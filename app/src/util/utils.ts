export function classNames(...names: unknown[]): string {
    return names.filter(name => typeof name === "string").join(" ")
}
