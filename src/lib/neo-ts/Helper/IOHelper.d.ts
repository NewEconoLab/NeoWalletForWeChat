import { ISerializable } from '../neo/IO/ISerializable';
export declare function asSerializable(arr: Uint8Array, T: Function): ISerializable;
export declare function fromSerializable(arr: Uint8Array, obj: ISerializable): Uint8Array;
