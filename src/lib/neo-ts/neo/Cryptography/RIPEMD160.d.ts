export declare class RIPEMD160 {
    private static zl;
    private static zr;
    private static sl;
    private static sr;
    private static hl;
    private static hr;
    private static bytesToWords(bytes);
    private static wordsToBytes(words);
    private static processBlock(H, M, offset);
    private static f1(x, y, z);
    private static f2(x, y, z);
    private static f3(x, y, z);
    private static f4(x, y, z);
    private static f5(x, y, z);
    private static rotl(x, n);
    static computeHash(data: ArrayBuffer | ArrayBufferView): ArrayBuffer;
}
