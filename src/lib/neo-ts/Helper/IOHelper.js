import { MemoryStream, BinaryReader, BinaryWriter } from '../index';
export function asSerializable(arr, T) {
    let ms = new MemoryStream(arr.buffer, false);
    let reader = new BinaryReader(ms);
    return reader.readSerializable(T);
}
export function fromSerializable(arr, obj) {
    let ms = new MemoryStream();
    let writer = new BinaryWriter(ms);
    obj.serialize(writer);
    return new Uint8Array(ms.toArray());
}
//# sourceMappingURL=IOHelper.js.map