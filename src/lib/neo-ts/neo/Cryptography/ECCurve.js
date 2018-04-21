"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ECFieldElement_1 = require("./ECFieldElement");
const ECPoint_1 = require("./ECPoint");
const BigInteger_1 = require("../BigInteger");
const UintHelper = require("../../Helper/UintHelper");
let _secp256k1;
let _secp256r1;
class ECCurve {
    static get secp256k1() {
        return _secp256k1 || (_secp256k1 = new ECCurve(BigInteger_1.BigInteger.fromString("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16), BigInteger_1.BigInteger.Zero, new BigInteger_1.BigInteger(7), BigInteger_1.BigInteger.fromString("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16), UintHelper.hexToBytes(("04" + "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798" + "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8"))));
    }
    static get secp256r1() {
        return _secp256r1 || (_secp256r1 = new ECCurve(BigInteger_1.BigInteger.fromString("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF", 16), BigInteger_1.BigInteger.fromString("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC", 16), BigInteger_1.BigInteger.fromString("5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B", 16), BigInteger_1.BigInteger.fromString("FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551", 16), UintHelper.hexToBytes("04" + "6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296" + "4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5")));
    }
    constructor(Q, A, B, N, G) {
        this.Q = Q;
        this.A = new ECFieldElement_1.ECFieldElement(A, this);
        this.B = new ECFieldElement_1.ECFieldElement(B, this);
        this.N = N;
        this.Infinity = new ECPoint_1.ECPoint(null, null, this);
        this.G = ECPoint_1.ECPoint.decodePoint(G, this);
    }
}
exports.ECCurve = ECCurve;
//# sourceMappingURL=ECCurve.js.map