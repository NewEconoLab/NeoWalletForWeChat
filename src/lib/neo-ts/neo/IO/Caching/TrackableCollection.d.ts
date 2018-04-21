import { ITrackable } from './ITrackable';
export declare class TrackableCollection<TKey, TItem extends ITrackable<TKey>> {
    private _map;
    constructor(items?: ArrayLike<TItem>);
    add(item: TItem): void;
    clear(): void;
    commit(): void;
    forEach(callback: (value: TItem, key: TKey, collection: TrackableCollection<TKey, TItem>) => void): void;
    get(key: TKey): TItem;
    getChangeSet(): TItem[];
    has(key: TKey): boolean;
    remove(key: TKey): void;
}
