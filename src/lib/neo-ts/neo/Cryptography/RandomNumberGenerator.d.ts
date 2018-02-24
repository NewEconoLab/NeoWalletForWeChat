export declare class RandomNumberGenerator {
    private static _entropy;
    private static _strength;
    private static _started;
    private static _stopped;
    private static _key;
    private static addEntropy(data, strength);
    static getRandomValues<T extends Int8Array | Uint8ClampedArray | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array>(array: T): T;
    private static getWeakRandomValues(array);
    private static processDeviceMotionEvent(event);
    private static processEvent(event);
    private static processMouseEvent(event);
    private static processTouchEvent(event);
    static startCollectors(): void;
    private static stopCollectors();
}
