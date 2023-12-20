type Listener<T> = (value: T) => void;
export declare class Wgl2Event<T> {
    private readonly listeners;
    addListener(listener: Listener<T>): void;
    removeListener(listener: Listener<T>): void;
    dispatch(value: T): void;
}
export {};
//# sourceMappingURL=event.d.ts.map