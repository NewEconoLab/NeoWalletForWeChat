// import {ISerializable,MemoryStream,BinaryReader,BinaryWriter} from '../../index'
// interface Uint8Array
// {
//     asSerializable(T: Function): ISerializable;
// }

// interface Uint8ArrayConstructor
// {
//     fromSerializable(obj: ISerializable): Uint8Array;
// }

// Uint8Array.prototype.asSerializable = function (T: Function): ISerializable
// {
//     let ms = new MemoryStream(this.buffer, false);
//     let reader = new BinaryReader(ms);
//     return reader.readSerializable(T);
// }

// Uint8Array.fromSerializable = function (obj: ISerializable): Uint8Array
// {
//     let ms = new MemoryStream();
//     let writer = new BinaryWriter(ms);
//     obj.serialize(writer);
//     return new Uint8Array(ms.toArray());
// }
