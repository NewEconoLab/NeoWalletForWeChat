export declare class Sha256 {
    private static K;
    static computeHash(data: ArrayBuffer | ArrayBufferView): ArrayBuffer;
    private static ROTR(n, x);
    private static Σ0(x);
    private static Σ1(x);
    private static σ0(x);
    private static σ1(x);
    private static Ch(x, y, z);
    private static Maj(x, y, z);
}
