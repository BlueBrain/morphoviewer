/**
 * A Reference Map counts how many time you want to insert the same key.
 * And it tells you when you delete it as many times.
 */
export default class RefMap<KeyType, ValType> {
    private readonly map = new Map<KeyType, ValType>()
    private readonly count = new Map<KeyType, number>()

    /**
     * If `key` is already stored in the map,
     * we add a reference to the mapped value and return it.
     * If not, we create the mapped value by calling `factory()`.
     */
    add(key: KeyType, factory: () => ValType): ValType {
        const { map, count } = this
        if (count.has(key)) {
            count.set(key, 1 + (count.get(key) ?? 0))
            const curVal = map.get(key)
            if (!curVal) throw Error("[CountMap] Map should not be empty!")
            return curVal
        }

        const newVal = factory()
        map.set(key, newVal)
        count.set(key, 1)
        return newVal
    }

    /**
     * Delete a reference to `key`.
     * If the last reference has been removed,
     * then return the mapped value, otherwise
     * return `undefined`.
     */
    delete(key: KeyType): ValType | undefined {
        const { map, count } = this
        if (!map.has(key)) return

        const newCount = (count.get(key) ?? 0) - 1
        if (newCount > 0) {
            count.set(key, newCount)
            return
        }

        const value = map.get(key)
        map.delete(key)
        count.delete(key)
        return value
    }
}
