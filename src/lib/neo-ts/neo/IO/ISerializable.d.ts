import { BinaryReader, BinaryWriter } from './index';
export interface ISerializable {
    deserialize(reader: BinaryReader): void;
    serialize(writer: BinaryWriter): void;
}
