interface Uint8Array
{
    asSerializable(T: Function): Neo.IO.ISerializable;
}

interface Uint8ArrayConstructor
{
    fromSerializable(obj: Neo.IO.ISerializable): Uint8Array;
}

Uint8Array.prototype.asSerializable = function (T: Function): Neo.IO.ISerializable
{
    let ms = new Neo.IO.MemoryStream(this.buffer, false);
    let reader = new Neo.IO.BinaryReader(ms);
    return reader.readSerializable(T);
}

Uint8Array.fromSerializable = function (obj: Neo.IO.ISerializable): Uint8Array
{
    let ms = new Neo.IO.MemoryStream();
    let writer = new Neo.IO.BinaryWriter(ms);
    obj.serialize(writer);
    return new Uint8Array(ms.toArray());
}
