import {ISerializable,MemoryStream,BinaryReader,BinaryWriter} from '../index'

export function asSerializable(arr:Uint8Array,T: Function): ISerializable
{
    let ms = new MemoryStream(arr.buffer, false);
    let reader = new BinaryReader(ms);
    return reader.readSerializable(T);
}

export function fromSerializable(arr:Uint8Array,obj: ISerializable): Uint8Array
{
    let ms = new MemoryStream();
    let writer = new BinaryWriter(ms);
    obj.serialize(writer);
    return new Uint8Array(ms.toArray());
}
