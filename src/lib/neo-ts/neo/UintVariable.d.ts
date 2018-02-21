declare abstract class UintVariable {
    protected _bits: Uint32Array;
    readonly bits: Uint32Array;
    constructor(bits: number | Uint8Array | Uint32Array | number[]);
    compareTo(other: UintVariable): number;
    equals(other: UintVariable): boolean;
    toString(): string;
}
export { UintVariable };
