"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PromiseState;
(function (PromiseState) {
    PromiseState[PromiseState["pending"] = 0] = "pending";
    PromiseState[PromiseState["fulfilled"] = 1] = "fulfilled";
    PromiseState[PromiseState["rejected"] = 2] = "rejected";
})(PromiseState = exports.PromiseState || (exports.PromiseState = {}));
class NeoPromise {
    constructor(executor) {
        this._state = PromiseState.pending;
        this._callback_attached = false;
        if (executor != null)
            executor(this.resolve.bind(this), this.reject.bind(this));
    }
    static all(iterable) {
        return new NeoPromise((resolve, reject) => {
            if (iterable.length == 0) {
                resolve([]);
                return;
            }
            let results = new Array(iterable.length);
            let rejected = false;
            let onFulfilled = function (result) {
                results[this._tag] = result;
                for (let i = 0; i < iterable.length; i++)
                    if (iterable[i]._state != PromiseState.fulfilled)
                        return;
                resolve(results);
            };
            let onRejected = reason => {
                if (!rejected) {
                    rejected = true;
                    reject(reason);
                }
            };
            for (let i = 0; i < iterable.length; i++) {
                iterable[i]._tag = i;
                iterable[i].then(onFulfilled, onRejected);
            }
        });
    }
    catch(onRejected) {
        return this.then(null, onRejected);
    }
    checkState() {
        if (this._state != PromiseState.pending && this._callback_attached) {
            let callback = this._state == PromiseState.fulfilled ? this._onFulfilled : this._onRejected;
            let arg = this._state == PromiseState.fulfilled ? this._value : this._reason;
            let value, reason;
            try {
                value = callback == null ? this : callback.call(this, arg);
            }
            catch (ex) {
                reason = ex;
            }
            if (this._next_promise == null) {
                if (reason != null)
                    return NeoPromise.reject(reason);
                else if (value instanceof NeoPromise)
                    return value;
                else
                    return NeoPromise.resolve(value);
            }
            else {
                if (reason != null)
                    this._next_promise.reject(reason);
                else if (value instanceof NeoPromise)
                    value.then(this.resolve.bind(this._next_promise), this.reject.bind(this._next_promise));
                else
                    this._next_promise.resolve(value);
            }
        }
    }
    reject(reason) {
        this._state = PromiseState.rejected;
        this._reason = reason;
        this.checkState();
    }
    static reject(reason) {
        return new NeoPromise((resolve, reject) => reject(reason));
    }
    resolve(value) {
        this._state = PromiseState.fulfilled;
        this._value = value;
        this.checkState();
    }
    static resolve(value) {
        if (value instanceof NeoPromise)
            return value;
        return new NeoPromise((resolve, reject) => resolve(value));
    }
    then(onFulfilled, onRejected) {
        this._onFulfilled = onFulfilled;
        this._onRejected = onRejected;
        this._callback_attached = true;
        if (this._state == PromiseState.pending) {
            this._next_promise = new NeoPromise(null);
            return this._next_promise;
        }
        else {
            return this.checkState();
        }
    }
}
exports.NeoPromise = NeoPromise;
//# sourceMappingURL=Promise.js.map