export declare class NeoMap<TKey, TValue> {
    private _map;
    private _size;
    readonly size: number;
    clear(): void;
    delete(key: TKey): boolean;
    forEach(callback: (value: TValue, key: TKey, map: NeoMap<TKey, TValue>) => void): void;
    get(key: TKey): TValue;
    has(key: TKey): boolean;
    set(key: TKey, value: TValue): void;
}
