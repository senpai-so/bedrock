export declare function prepareSignBytes(obj: any): any;
export declare abstract class JSONSerializable<A, D, P> {
    abstract toAmino(): A;
    abstract toData(): D;
    abstract toProto(): P;
    toJSON(): string;
    toAminoJSON(): string;
}
export declare function removeNull(obj: any): any;
