export default class Colors {
    private readonly onChange;
    private _soma;
    private _axon;
    private _apicalDendrite;
    private _basalDendrite;
    private _unknown;
    constructor(onChange: (colors: Colors) => void);
    get soma(): string;
    set soma(value: string);
    get axon(): string;
    set axon(value: string);
    get apicalDendrite(): string;
    set apicalDendrite(value: string);
    get basalDendrite(): string;
    set basalDendrite(value: string);
    get unknown(): string;
    set unknown(value: string);
    private fire;
}
//# sourceMappingURL=colors.d.ts.map