import * as crypto from 'crypto';
export class RandomNumberGenerator {
    static addEntropy(data, strength) {
        if (RandomNumberGenerator._stopped)
            return;
        for (let i = 0; i < data.length; i++)
            if (data[i] != null && data[i] != 0) {
                RandomNumberGenerator._entropy.push(data[i]);
                RandomNumberGenerator._strength += strength;
                RandomNumberGenerator._key = null;
            }
        if (RandomNumberGenerator._strength >= 512)
            RandomNumberGenerator.stopCollectors();
    }
    static getRandomValues(len) {
        return new Uint8Array(crypto.randomBytes(len));
    }
    static getWeakRandomValues(array) {
        let buffer = typeof array === "number" ? new Uint8Array(array) : array;
        for (let i = 0; i < buffer.length; i++)
            buffer[i] = Math.random() * 256;
        return buffer;
    }
    static processDeviceMotionEvent(event) {
        RandomNumberGenerator.addEntropy([event.accelerationIncludingGravity.x, event.accelerationIncludingGravity.y, event.accelerationIncludingGravity.z], 1);
        RandomNumberGenerator.processEvent(event);
    }
    static processEvent(event) {
        if (window.performance && window.performance.now)
            RandomNumberGenerator.addEntropy([window.performance.now()], 20);
        else
            RandomNumberGenerator.addEntropy([event.timeStamp], 2);
    }
    static processMouseEvent(event) {
        RandomNumberGenerator.addEntropy([event.clientX, event.clientY, event.offsetX, event.offsetY, event.screenX, event.screenY], 4);
        RandomNumberGenerator.processEvent(event);
    }
    static processTouchEvent(event) {
        let touches = event.changedTouches || event.touches;
        for (let i = 0; i < touches.length; i++)
            RandomNumberGenerator.addEntropy([touches[i].clientX, touches[i].clientY, touches[i]["radiusX"], touches[i]["radiusY"], touches[i]["force"]], 1);
        RandomNumberGenerator.processEvent(event);
    }
    static startCollectors() {
        if (RandomNumberGenerator._started)
            return;
        window.addEventListener("load", RandomNumberGenerator.processEvent, false);
        window.addEventListener("mousemove", RandomNumberGenerator.processMouseEvent, false);
        window.addEventListener("keypress", RandomNumberGenerator.processEvent, false);
        window.addEventListener("devicemotion", RandomNumberGenerator.processDeviceMotionEvent, false);
        window.addEventListener("touchmove", RandomNumberGenerator.processTouchEvent, false);
        RandomNumberGenerator._started = true;
    }
    static stopCollectors() {
        if (RandomNumberGenerator._stopped)
            return;
        window.removeEventListener("load", RandomNumberGenerator.processEvent, false);
        window.removeEventListener("mousemove", RandomNumberGenerator.processMouseEvent, false);
        window.removeEventListener("keypress", RandomNumberGenerator.processEvent, false);
        window.removeEventListener("devicemotion", RandomNumberGenerator.processDeviceMotionEvent, false);
        window.removeEventListener("touchmove", RandomNumberGenerator.processTouchEvent, false);
        RandomNumberGenerator._stopped = true;
    }
}
RandomNumberGenerator._entropy = [];
RandomNumberGenerator._strength = 0;
RandomNumberGenerator._started = false;
RandomNumberGenerator._stopped = false;
//# sourceMappingURL=RandomNumberGenerator.js.map