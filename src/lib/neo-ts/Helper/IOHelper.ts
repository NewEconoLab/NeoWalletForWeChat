import { ISerializable } from '../neo/IO/ISerializable'
import { MemoryStream } from '../neo/IO/MemoryStream'
import { BinaryReader } from '../neo/IO/BinaryReader'
import { BinaryWriter } from '../neo/IO/BinaryWriter'
export function asSerializable(arr: Uint8Array, T: Function): ISerializable {
    let ms = new MemoryStream(arr.buffer, false);
    let reader = new BinaryReader(ms);
    return reader.readSerializable(T);
}

export function fromSerializable(arr: Uint8Array, obj: ISerializable): Uint8Array {
    let ms = new MemoryStream();
    let writer = new BinaryWriter(ms);
    obj.serialize(writer);
    return new Uint8Array(ms.toArray());
}
