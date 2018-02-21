"use strict";
exports.__esModule = true;
var index_1 = require("../../index");
var RandomNumberGenerator = /** @class */ (function () {
    function RandomNumberGenerator() {
    }
    RandomNumberGenerator.addEntropy = function (data, strength) {
        if (RandomNumberGenerator._stopped)
            return;
        for (var i = 0; i < data.length; i++)
            if (data[i] != null && data[i] != 0) {
                RandomNumberGenerator._entropy.push(data[i]);
                RandomNumberGenerator._strength += strength;
                RandomNumberGenerator._key = null;
            }
        if (RandomNumberGenerator._strength >= 512)
            RandomNumberGenerator.stopCollectors();
    };
    RandomNumberGenerator.getRandomValues = function (array) {
        if (RandomNumberGenerator._strength < 256)
            throw new Error();
        if (RandomNumberGenerator._key == null) {
            var data = new Float64Array(RandomNumberGenerator._entropy);
            RandomNumberGenerator._key = new Uint8Array(index_1.Sha256.computeHash(data));
        }
        var aes = new index_1.Aes(RandomNumberGenerator._key, RandomNumberGenerator.getWeakRandomValues(16));
        var src = new Uint8Array(16);
        var dst = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
        for (var i = 0; i < dst.length; i += 16) {
            aes.encryptBlock(RandomNumberGenerator.getWeakRandomValues(16), src);
            Array.copy(src, 0, dst, i, Math.min(dst.length - i, 16));
        }
        return array;
    };
    RandomNumberGenerator.getWeakRandomValues = function (array) {
        var buffer = typeof array === "number" ? new Uint8Array(array) : array;
        for (var i = 0; i < buffer.length; i++)
            buffer[i] = Math.random() * 256;
        return buffer;
    };
    RandomNumberGenerator.processDeviceMotionEvent = function (event) {
        RandomNumberGenerator.addEntropy([event.accelerationIncludingGravity.x, event.accelerationIncludingGravity.y, event.accelerationIncludingGravity.z], 1);
        RandomNumberGenerator.processEvent(event);
    };
    RandomNumberGenerator.processEvent = function (event) {
        if (window.performance && window.performance.now)
            RandomNumberGenerator.addEntropy([window.performance.now()], 20);
        else
            RandomNumberGenerator.addEntropy([event.timeStamp], 2);
    };
    RandomNumberGenerator.processMouseEvent = function (event) {
        RandomNumberGenerator.addEntropy([event.clientX, event.clientY, event.offsetX, event.offsetY, event.screenX, event.screenY], 4);
        RandomNumberGenerator.processEvent(event);
    };
    RandomNumberGenerator.processTouchEvent = function (event) {
        var touches = event.changedTouches || event.touches;
        for (var i = 0; i < touches.length; i++)
            RandomNumberGenerator.addEntropy([touches[i].clientX, touches[i].clientY, touches[i]["radiusX"], touches[i]["radiusY"], touches[i]["force"]], 1);
        RandomNumberGenerator.processEvent(event);
    };
    RandomNumberGenerator.startCollectors = function () {
        if (RandomNumberGenerator._started)
            return;
        window.addEventListener("load", RandomNumberGenerator.processEvent, false);
        window.addEventListener("mousemove", RandomNumberGenerator.processMouseEvent, false);
        window.addEventListener("keypress", RandomNumberGenerator.processEvent, false);
        window.addEventListener("devicemotion", RandomNumberGenerator.processDeviceMotionEvent, false);
        window.addEventListener("touchmove", RandomNumberGenerator.processTouchEvent, false);
        RandomNumberGenerator._started = true;
    };
    RandomNumberGenerator.stopCollectors = function () {
        if (RandomNumberGenerator._stopped)
            return;
        window.removeEventListener("load", RandomNumberGenerator.processEvent, false);
        window.removeEventListener("mousemove", RandomNumberGenerator.processMouseEvent, false);
        window.removeEventListener("keypress", RandomNumberGenerator.processEvent, false);
        window.removeEventListener("devicemotion", RandomNumberGenerator.processDeviceMotionEvent, false);
        window.removeEventListener("touchmove", RandomNumberGenerator.processTouchEvent, false);
        RandomNumberGenerator._stopped = true;
    };
    RandomNumberGenerator._entropy = [];
    RandomNumberGenerator._strength = 0;
    RandomNumberGenerator._started = false;
    RandomNumberGenerator._stopped = false;
    return RandomNumberGenerator;
}());
exports.RandomNumberGenerator = RandomNumberGenerator;
