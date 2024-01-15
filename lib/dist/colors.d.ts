import { Wgl2Event } from "./webgl2/event";
export declare function colorContrast(background: string, ...colors: string[]): string;
export declare function colorLuminance(red: number, green: number, blue: number): number;
export declare function colorToRGBA(color: string): [red: number, green: number, blue: number, alpha: number];
export interface ColorsInterface {
    background: string;
    soma: string;
    axon: string;
    apicalDendrite: string;
    basalDendrite: string;
}
export default class Colors implements ColorsInterface {
    readonly eventChange: Wgl2Event<Colors>;
    private _background;
    private _soma;
    private _axon;
    private _apicalDendrite;
    private _basalDendrite;
    private _unknown;
    get background(): string;
    set background(value: string);
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