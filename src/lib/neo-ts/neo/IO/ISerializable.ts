import { BinaryReader } from './BinaryReader'
import { BinaryWriter } from './BinaryWriter'
export interface ISerializable {
    deserialize(reader: BinaryReader): void;
    serialize(writer: BinaryWriter): void;
}
